import React, { useState, useMemo, useEffect } from 'react'
import styled from 'styled-components'
import PageSection from 'components/PageSection'
import { useWeb3React } from '@web3-react/core'
import useTheme from 'hooks/useTheme'
import Container from 'components/Layout/Container'
import Page, { PageMeta } from 'components/Layout/Page'
import { useTranslation } from 'contexts/Localization'
import { Flex, Box, Text, Heading, Card, Skeleton } from '@dxswap/uikit'
import { formatAmount } from 'views/Info/utils/formatInfoNumbers'
import LineChart from 'views/Info/components/InfoCharts/LineChart'
import BarChart from 'views/Info/components/InfoCharts/BarChart'
import { format, fromUnixTime } from 'date-fns'
import { PoolUpdater, ProtocolUpdater, TokenUpdater } from 'state/info/updaters'
import {
  useAllPoolData,
  useAllTokenData,
  useProtocolChartData,
  useProtocolData,
  useProtocolTransactions,
} from 'state/info/hooks'

import Hero from './components/Hero'
import { swapSectionData, earnSectionData, cakeSectionData } from './components/SalesSection/data'
import MetricsSection from './components/MetricsSection'
import SalesSection from './components/SalesSection'
import WinSection from './components/WinSection'
import FarmsPoolsRow from './components/FarmsPoolsRow'
import Footer from './components/Footer'
import CakeDataRow from './components/CakeDataRow'
import { WedgeTopLeft, InnerWedgeWrapper, OuterWedgeWrapper, WedgeTopRight } from './components/WedgeSvgs'
import UserBanner from './components/UserBanner'


const StyledHeroSection = styled(PageSection)`
  padding-top: 16px;

  ${({ theme }) => theme.mediaQueries.md} {
    padding-top: 48px;
  }
`

const UserBannerWrapper = styled(Container)`
  z-index: 1;
  position: absolute;
  width: 100%;
  top: 0;
  left: 50%;
  transform: translate(-50%, 0);
  padding-left: 0px;
  padding-right: 0px;

  ${({ theme }) => theme.mediaQueries.lg} {
    padding-left: 24px;
    padding-right: 24px;
  }
`

export const ChartCardsContainer = styled(Flex)`
  justify-content: space-between;
  flex-direction: column;
  width: 100%;
  padding: 0;
  gap: 1em;

  & > * {
    width: 100%;
  }

  ${({ theme }) => theme.mediaQueries.md} {
    flex-direction: row;
  } ;
`

const Home: React.FC = () => {
  const { theme } = useTheme()
  const { account } = useWeb3React()
  const { t } = useTranslation()
  const [liquidityHover, setLiquidityHover] = useState<number | undefined>()
  const [liquidityDateHover, setLiquidityDateHover] = useState<string | undefined>()
  const [volumeHover, setVolumeHover] = useState<number | undefined>()
  const [volumeDateHover, setVolumeDateHover] = useState<string | undefined>()

  const [protocolData] = useProtocolData()
  const [chartData] = useProtocolChartData()
  const [transactions] = useProtocolTransactions()

  const currentDate = format(new Date(), 'MMM d, yyyy')

  // Getting latest liquidity and volumeUSD to display on top of chart when not hovered
  useEffect(() => {
    if (volumeHover == null && protocolData) {
      setVolumeHover(protocolData.volumeUSD)
    }
  }, [protocolData, volumeHover])
  useEffect(() => {
    if (liquidityHover == null && protocolData) {
      setLiquidityHover(protocolData.liquidityUSD)
    }
  }, [liquidityHover, protocolData])

  const formattedLiquidityData = useMemo(() => {
    if (chartData) {
      return chartData.map((day) => {
        return {
          time: fromUnixTime(day.date),
          value: day.liquidityUSD,
        }
      })
    }
    return []
  }, [chartData])

  const formattedVolumeData = useMemo(() => {
    if (chartData) {
      return chartData.map((day) => {
        return {
          time: fromUnixTime(day.date),
          value: day.volumeUSD,
        }
      })
    }
    return []
  }, [chartData])

  const HomeSectionContainerStyles = { margin: '0', width: '100%', maxWidth: '968px' }

  return (
    <Page>
      <ProtocolUpdater />
      <PoolUpdater />
      <TokenUpdater />
      <Heading scale="lg" mb="16px" id="info-overview-title">
         Information & Analytics
      </Heading>
      <ChartCardsContainer>
        <Card>
          <Box p={['16px', '16px', '24px']}>
            <Text bold color="secondary">
              {t('Liquidity')}
            </Text>
            {liquidityHover > 0 ? (
              <Text bold fontSize="24px">
                ${formatAmount(liquidityHover)}
              </Text>
            ) : (
              <Skeleton width="128px" height="36px" />
            )}
            <Text>{liquidityDateHover ?? currentDate}</Text>
            <Box height="250px">
              <LineChart
                data={formattedLiquidityData}
                setHoverValue={setLiquidityHover}
                setHoverDate={setLiquidityDateHover}
              />
            </Box>
          </Box>
        </Card>
        <Card>
          <Box p={['16px', '16px', '24px']}>
            <Text bold color="secondary">
              {t('Volume 24H')}
            </Text>
            {volumeHover > 0 ? (
              <Text bold fontSize="24px">
                ${formatAmount(volumeHover)}
              </Text>
            ) : (
              <Skeleton width="128px" height="36px" />
            )}
            <Text>{volumeDateHover ?? currentDate}</Text>
            <Box height="250px">
              <BarChart data={formattedVolumeData} setHoverValue={setVolumeHover} setHoverDate={setVolumeDateHover} />
            </Box>
          </Box>
        </Card>
      </ChartCardsContainer>
    </Page>


    // <>
    //   <PageMeta />
    //   <StyledHeroSection
    //     innerProps={{ style: { margin: '0', width: '100%' } }}
    //     background={
    //       theme.isDark
    //         ? 'radial-gradient(103.12% 50% at 50% 50%, #21193A 0%, #191326 100%)'
    //         : 'linear-gradient(139.73deg, #E6FDFF 0%, #F3EFFF 100%)'
    //     }
    //     index={2}
    //     hasCurvedDivider={false}
    //   >
    //     {account && (
    //       <UserBannerWrapper>
    //         <UserBanner />
    //       </UserBannerWrapper>
    //     )}
    //     <Hero />
    //   </StyledHeroSection>
    //   <PageSection
    //     innerProps={{ style: { margin: '0', width: '100%' } }}
    //     background={
    //       theme.isDark
    //         ? 'linear-gradient(180deg, #09070C 22%, #201335 100%)'
    //         : 'linear-gradient(180deg, #FFFFFF 22%, #D7CAEC 100%)'
    //     }
    //     index={2}
    //     hasCurvedDivider={false}
    //   >
    //     <MetricsSection />
    //   </PageSection>
    //   <PageSection
    //     innerProps={{ style: HomeSectionContainerStyles }}
    //     background={theme.colors.background}
    //     index={2}
    //     hasCurvedDivider={false}
    //   >
    //     <OuterWedgeWrapper>
    //       <InnerWedgeWrapper top fill={theme.isDark ? '#201335' : '#D8CBED'}>
    //         <WedgeTopLeft />
    //       </InnerWedgeWrapper>
    //     </OuterWedgeWrapper>
    //     <SalesSection {...swapSectionData} />
    //   </PageSection>
    //   <PageSection
    //     innerProps={{ style: HomeSectionContainerStyles }}
    //     background={theme.colors.gradients.cardHeader}
    //     index={2}
    //     hasCurvedDivider={false}
    //   >
    //     <OuterWedgeWrapper>
    //       <InnerWedgeWrapper width="150%" top fill={theme.colors.background}>
    //         <WedgeTopRight />
    //       </InnerWedgeWrapper>
    //     </OuterWedgeWrapper>
    //     <SalesSection {...earnSectionData} />
    //     <FarmsPoolsRow />
    //   </PageSection>
    //   <PageSection
    //     innerProps={{ style: HomeSectionContainerStyles }}
    //     background={
    //       theme.isDark
    //         ? 'linear-gradient(180deg, #0B4576 0%, #091115 100%)'
    //         : 'linear-gradient(180deg, #6FB6F1 0%, #EAF2F6 100%)'
    //     }
    //     index={2}
    //     hasCurvedDivider={false}
    //   >
    //     <WinSection />
    //   </PageSection>
    //   <PageSection
    //     innerProps={{ style: HomeSectionContainerStyles }}
    //     background={theme.colors.background}
    //     index={2}
    //     hasCurvedDivider={false}
    //   >
    //     <SalesSection {...cakeSectionData} />
    //     <CakeDataRow />
    //   </PageSection>
    //   <PageSection
    //     innerProps={{ style: HomeSectionContainerStyles }}
    //     background="linear-gradient(180deg, #7645D9 0%, #5121B1 100%)"
    //     index={2}
    //     hasCurvedDivider={false}
    //   >
    //     <Footer />
    //   </PageSection>
    // </>
  )
}

export default Home
