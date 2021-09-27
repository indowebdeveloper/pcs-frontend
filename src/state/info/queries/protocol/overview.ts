import { useState, useEffect } from 'react'
import { request, gql } from 'graphql-request'
import { INFO_CLIENT } from 'config/constants/endpoints'
import { getChangeForPeriod, getPercentChange } from 'views/Info/utils/infoDataHelpers'
import { ProtocolData } from 'state/info/types'
import { getDeltaTimestamps } from 'views/Info/utils/infoQueryHelpers'
import { useBlocksFromTimestamps } from 'views/Info/hooks/useBlocksFromTimestamps'

interface PancakeFactory {
  totalTransactions: string
  tradeVolumeUSD: string
  totalLiquidity: string
}

interface OverviewResponse {
  token: PancakeFactory
}

/**
 * Latest Liquidity, Volume and Transaction count
 */
const getOverviewData = async (block?: number): Promise<{ data?: OverviewResponse; error: boolean }> => {
  try {
    const query = gql`query overview {
      token(
        ${block ? `block: { number: ${block}}` : ``} 
        id: "0x0b1c18d855c8347650be4be3ffc2f59ba9695c44"
        ) {
        totalTransactions
        tradeVolumeUSD
        totalLiquidity
      }
    }`
    console.log(query)
    const data = await request<OverviewResponse>(INFO_CLIENT, query)
    
    return { data, error: false }
  } catch (error) {
    console.error('Failed to fetch info overview', error)
    return { data: null, error: true }
  }
}

const formatPancakeFactoryResponse = (rawPancakeFactory?: PancakeFactory) => {
  if (rawPancakeFactory) {
    return {
      totalTransactions: parseFloat(rawPancakeFactory.totalTransactions),
      tradeVolumeUSD: parseFloat(rawPancakeFactory.tradeVolumeUSD),
      totalLiquidity: parseFloat(rawPancakeFactory.totalLiquidity),
    }
  }
  return null
}

interface ProtocolFetchState {
  error: boolean
  data?: ProtocolData
}

const useFetchProtocolData = (): ProtocolFetchState => {
  const [fetchState, setFetchState] = useState<ProtocolFetchState>({
    error: false,
  })
  const [t24, t48] = getDeltaTimestamps()
  const { blocks, error: blockError } = useBlocksFromTimestamps([t24, t48])
  const [block24, block48] = blocks ?? []

  useEffect(() => {
    const fetch = async () => {
      const { error, data } = await getOverviewData()
      const { error: error24, data: data24 } = await getOverviewData(block24?.number ?? undefined)
      const { error: error48, data: data48 } = await getOverviewData(block48?.number ?? undefined)
      const anyError = error || error24 || error48
      const overviewData = formatPancakeFactoryResponse(data?.token)
      const overviewData24 = formatPancakeFactoryResponse(data24?.token)
      const overviewData48 = formatPancakeFactoryResponse(data48?.token)
      const allDataAvailable = overviewData && overviewData24 && overviewData48
      if (anyError || !allDataAvailable) {
        setFetchState({
          error: true,
        })
      } else {
        const [volumeUSD, volumeUSDChange] = getChangeForPeriod(
          overviewData.tradeVolumeUSD,
          overviewData24.tradeVolumeUSD,
          overviewData48.tradeVolumeUSD,
        )
        const liquidityUSDChange = getPercentChange(overviewData.totalLiquidity, overviewData24.totalLiquidity)
        // 24H transactions
        const [txCount, txCountChange] = getChangeForPeriod(
          overviewData.totalTransactions,
          overviewData24.totalTransactions,
          overviewData48.totalTransactions,
        )
        const protocolData: ProtocolData = {
          volumeUSD,
          volumeUSDChange: typeof volumeUSDChange === 'number' ? volumeUSDChange : 0,
          liquidityUSD: overviewData.totalLiquidity,
          liquidityUSDChange,
          txCount,
          txCountChange,
        }
        setFetchState({
          error: false,
          data: protocolData,
        })
      }
    }
    const allBlocksAvailable = block24?.number && block48?.number
    if (allBlocksAvailable && !blockError && !fetchState.data) {
      fetch()
    }
  }, [block24, block48, blockError, fetchState])

  return fetchState
}

export default useFetchProtocolData
