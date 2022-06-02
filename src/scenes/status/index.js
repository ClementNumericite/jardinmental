import React, { useEffect, useState } from "react";
import { StyleSheet, View, SafeAreaView, TouchableOpacity, Dimensions, Animated } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import Text from "../../components/MyText";
import StatusItem from "./status-item";
import Header from "../../components/Header";
import { colors } from "../../utils/colors";
import { useContext } from "react";
import { DiaryDataContext } from "../../context/diaryData";
import localStorage from "../../utils/localStorage";
import NPS from "../../services/NPS/NPS";
import Bubble from "../../components/bubble";
import ArrowUpSvg from "../../../assets/svg/arrow-up.svg";
import logEvents from "../../services/logEvents";
import { formatDateThread } from "../../utils/date/helpers";
import BannerProNPS from "./bannerProNPS";
import TabPicker from "./TabPicker";
import RecapCompletion from "./recapCompletion";
import NoData from "./NoData";
import Diary from "../../scenes/diary";
import { canEdit } from "./utils/index.js";
import ContributeCard from "../contribute/contributeCard";
import FloatingPlusButton from "../../components/FloatingPlusButton";

const LIMIT_PER_PAGE = __DEV__ ? 3 : 30;

const Status = ({ navigation, startSurvey }) => {
  const [diaryData] = useContext(DiaryDataContext);
  const [NPSvisible, setNPSvisible] = useState(false);
  const [page, setPage] = useState(1);
  const [bannerProNPSVisible, setBannerProNPSVisible] = useState(true);
  const [ongletActif, setOngletActif] = useState("all");
  const scrollRef = React.useRef();

  React.useEffect(() => {
    scrollRef.current?.scrollTo({
      y: 0,
      animated: false,
    });
  }, [ongletActif]);

  // ****************
  // BEGIN - MASQUAGE DU HEADER AU SCROLL
  const headerHeight = 50;
  const scrollY = React.useRef(new Animated.Value(0));
  const handleScroll = Animated.event(
    [
      {
        nativeEvent: {
          contentOffset: { y: scrollY.current },
        },
      },
    ],
    {
      useNativeDriver: true,
    }
  );

  const scrollYClampedForHeader = Animated.diffClamp(scrollY.current, 0, headerHeight);

  let translateX = scrollY.current.interpolate({
    inputRange: [0, 100],
    outputRange: [80, 0],
    extrapolateRight: "clamp",
  });

  const translateY = scrollYClampedForHeader.interpolate({
    inputRange: [0, headerHeight],
    outputRange: [0, -headerHeight],
  });

  const opacity = translateY.interpolate({
    inputRange: [-headerHeight, 0],
    outputRange: [0, 1],
  });

  // FIN - MASQUAGE DU HEADER AU SCROLL
  // ****************

  useEffect(() => {
    (async () => {
      const onboardingStep = await localStorage.getOnboardingStep();
      const onboardingIsDone = await localStorage.getOnboardingDone();

      //if ONBOARDING_DONE is true, do nothing
      if (onboardingIsDone) {
        return;
      } else {
        const isFirstAppLaunch = await localStorage.getIsFirstAppLaunch();
        if (isFirstAppLaunch !== "false") {
          navigation.navigate("onboarding", {
            screen: onboardingStep || "OnboardingPresentation",
          });
        }
      }
    })();
  }, [navigation]);

  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        const bannerProNPSDone = await localStorage.getNpsProContact();
        const supported = await localStorage.getSupported();
        setBannerProNPSVisible(supported === "PRO" && !bannerProNPSDone);
      })();
    }, [])
  );

  const noData = () => !Object.keys(diaryData).some((key) => diaryData[key]);

  const renderJournalEntrees = () => {
    return (
      <>
        {Object.keys(diaryData)
          .sort((a, b) => {
            a = a.split("/").reverse().join("");
            b = b.split("/").reverse().join("");
            return b.localeCompare(a);
          })
          .slice(0, LIMIT_PER_PAGE * page)
          .map((date) => (
            <View key={date}>
              <View style={styles.dateContainer}>
                <View style={styles.dateDot} />
                {canEdit(date) ? (
                  <Text style={styles.dateLabel}>{formatDateThread(date)}</Text>
                ) : (
                  <TouchableOpacity
                    style={styles.item}
                    onPress={() => navigation.navigate("too-late", { date })}
                  >
                    <Text style={styles.dateLabel}>{formatDateThread(date)}</Text>
                  </TouchableOpacity>
                )}
              </View>
              <StatusItem date={date} patientState={diaryData[date]} navigation={navigation} />
            </View>
          ))}
        <Bubble diaryData={diaryData} navigation={navigation} />
        <ContributeCard onPress={() => setNPSvisible(true)} />
        {Object.keys(diaryData)?.length > LIMIT_PER_PAGE * page && (
          <TouchableOpacity onPress={() => setPage(page + 1)} style={styles.versionContainer}>
            <Text style={styles.arrowDownLabel}>Voir plus</Text>
            <ArrowUpSvg style={styles.arrowDown} color={colors.BLUE} />
          </TouchableOpacity>
        )}
      </>
    );
  };

  const renderOnglet = (onglet) => {
    if (onglet === "all") {
      // display only LIMIT_PER_PAGE days
      // button that will display LIMIT_PER_PAGE more each time
      return (
        <View style={styles.container}>
          {bannerProNPSVisible ? (
            <BannerProNPS onClose={() => setBannerProNPSVisible(false)} />
          ) : (
            <>
              <RecapCompletion navigation={navigation} />
              <View style={styles.divider} />
              {renderJournalEntrees()}
            </>
          )}
        </View>
      );
    }
    if (onglet === "NOTES") {
      return <Diary hideDeader />;
    }
    return null;
  };

  return (
    <>
      <SafeAreaView style={[styles.safe]}>
        <Animated.View style={{ flex: 1 }}>
          <NPS forceView={NPSvisible} close={() => setNPSvisible(false)} />
          {/* todo : add this 👇 to make this component scrollable
            { transform: [{ translateY }] }
          */}
          <Animated.View style={[styles.headerContainer]}>
            {/* todo : add this 👇 to make this component scrollable
            style={{ opacity }}
          */}
            <Animated.View>
              <Header title="Mes entrées" navigation={navigation} />
            </Animated.View>
            <TabPicker ongletActif={ongletActif} onChange={setOngletActif} />
          </Animated.View>
          {noData() ? (
            <NoData navigation={navigation} />
          ) : (
            <>
              <Animated.ScrollView
                alwaysBounceHorizontal={false}
                alwaysBounceVertical={false}
                ref={scrollRef}
                bounces={false}
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContainer}
                onScroll={handleScroll}
                showsVerticalScrollIndicator={false}
              >
                {renderOnglet(ongletActif)}
              </Animated.ScrollView>
            </>
          )}
        </Animated.View>
      </SafeAreaView>
      <FloatingPlusButton shadow onPress={startSurvey} plusPosition={translateX} />
    </>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    width: "100%",
    zIndex: 1,

    paddingTop: 5,
    paddingBottom: 0,
    backgroundColor: "#1FC6D5",
  },
  arrowDown: {
    transform: [{ rotate: "180deg" }],
  },
  arrowDownLabel: {
    color: colors.BLUE,
  },
  versionContainer: {
    marginTop: 20,
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  safe: {
    flex: 1,
    backgroundColor: "#1FC6D5",
  },
  scrollView: {
    backgroundColor: "white",
  },
  container: {
    padding: 20,
  },
  scrollContainer: {
    paddingBottom: 80,
    paddingTop: 50 * 2,
  },
  title: {
    fontSize: 19,
    paddingBottom: 10,
    color: colors.BLUE,
    fontWeight: "700",
  },
  flex: {
    display: "flex",
    flexDirection: "row",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.LIGHT_BLUE,
  },
  dateLabel: {
    color: "#000",
    fontSize: 13,
    textAlign: "left",
    paddingLeft: 10,
    fontWeight: "600",
  },
  verticalBorder: {
    borderLeftWidth: 1,
    borderColor: "#00CEF7",
  },
  setupButton: {
    backgroundColor: colors.LIGHT_BLUE,
    borderRadius: 45,
    paddingHorizontal: 10,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
    display: "flex",
  },
  setupButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: Dimensions.get("window").width > 350 ? 19 : 15,
    flexWrap: "wrap",
    textAlign: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 40,
    width: "50%",
    alignSelf: "center",
  },
});

export default Status;
