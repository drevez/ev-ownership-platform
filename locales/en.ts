export const en = {
  navigation: {
    models: "Models",
    compare: "Compare",
    idealEv: "Find the Ideal EV"
  },
  common: {
    loading: "Loading...",
    back: "Back",
    notAvailable: "N/A",
    yes: "Yes",
    no: "No"
  },
  metadata: {
    title: "MotorZero | A Simple Electric Car Comparison Tool ✅",
    titleTemplate: "%s | MotorZero",
    description: "Compare electric cars, range, charging and prices. Personalised recommendations to help you choose the car that suits your everyday needs."
  },
  home: {
    hero: {
      eyebrow: "Smart Electric Vehicle Platform",
      title: "Everything about EVs. In human language.",
      subtitle: "Battery life, charging speed, monthly costs — everything you need to choose confidently.",
      primaryButton: "Find the right EV",
      secondaryButton: "Compare cars",
      searchPlaceholder: "Search models, brands or comparisons...",
      searchButton: "Search"
    },
    featuredComparisons: {
      eyebrow: "Most Popular Comparisons",
      title: "Featured Comparisons",
      viewAll: "View all →",
      compareAriaLabel: "Compare {title}"
    },
    lifestyle: {
      eyebrow: "Explore",
      title: "Choose based on your lifestyle",
      items: [
        "Family",
        "Long Trips",
        "Apartment",
        "City",
        "Performance",
        "First EV"
      ]
    },
    featuredVehicles: {
      eyebrow: "Most Popular",
      title: "Electric cars everyone is talking about",
      realRange: "Real Range",
      fastCharging: "Fast Charging",
      viewModel: "View Model"
    },
    finalCta: {
      eyebrow: "Smart Recommendations",
      title: "Choosing an electric car does not need to be complicated.",
      description: "Get personalized recommendations based on your driving habits, daily needs and charging access.",
      button: "Discover Your Ideal EV"
    }
  },
  recommendation: {
    excellentMatch: "Excellent match",
    greatFamilyEv: "Great family EV",
    apartmentOption: "Strong apartment charging option",
    commuterEv: "Ideal commuter EV",
    longDistance: "Long-distance capable",
    valueOption: "Good value option",
    whyVehicle: "Why this vehicle?",
    drawbacks: "Potential drawbacks",
    chargingPerMonth: "charging/month",
    viewVehicle: "View vehicle details",
    electricVehicle: "Electric vehicle"
  },
  recommendPage: {
    metadataTitle: "Find the right electric car",
    metadataDescription: "Recommendation engine that weighs budget, range, charging, space, and ownership priorities.",
    eyebrow: "Personalised recommendation",
    title: "Discover the electric car that’s right for you",
    description: "Our recommendation engine reviews the catalogue and finds the models that best suit your budget, intended use and priorities."
  },
  recommendQuiz: {
    title: "Usage profile",
    description: "Answer with your real scenario. The engine weighs budget, range, charging, space, efficiency, and preferences to rank the whole catalog.",
    maxBudget: "Maximum budget",
    purchase: "Purchase",
    chargingAccess: "Charging access",
    roadTrips: "Long trips",
    peopleInCar: "People in the car",
    dailyCommute: "Daily commute",
    cargoNeed: "Cargo need",
    bodyPreference: "Preferred body style",
    decisionStyle: "Decision style",
    priorities: "Priorities",
    profileSummary: "Profile summary",
    knowledgeLabel: "How do you want to use the recommender?",
    simpleMode: "Simple",
    advancedMode: "Advanced",
    simpleModeDescription: "Everyday questions, less jargon, and recommendations explained in plain language.",
    advancedModeDescription: "More control over technical criteria, preferences, and scoring.",
    guidedIntroTitle: "You do not need to know technical terms.",
    guidedIntroDescription: "Tell us your budget, routine, trips, and space needs. We translate that into real range, charging, cost, and data confidence.",
    simpleAssumptionsTitle: "In simple mode, the recommender assumes:",
    simpleAssumptions: [
      "no strict body-style preference",
      "balanced weight between price, real range, and charging",
      "practical priorities for daily use"
    ],
    simpleQuestions: {
      budget: "What is the most you want to spend?",
      purchase: "Are you open to both new and used?",
      charging: "Where will you charge most of the time?",
      dailyCommute: "How many km do you drive on a normal day?",
      people: "How many people usually ride in the car?",
      roadTrips: "Do you do longer trips?",
      cargo: "Do you need a lot of boot space?"
    },
    kmPerDay: "km/day",
    loading: "Analyzing catalog...",
    submit: "Find best options",
    helper: "Returns the best results with reasons and watch-outs.",
    error: "Could not generate recommendations right now. Please try again.",
    purchaseOptions: {
      either: "New or used",
      new: "New",
      used: "Used"
    },
    chargingOptions: {
      home: "Home",
      work: "Work",
      public: "Mostly public",
      mixed: "Mixed"
    },
    roadTripOptions: {
      rarely: "Rarely",
      sometimes: "Sometimes",
      often: "Often"
    },
    cargoOptions: {
      light: "Light",
      medium: "Medium",
      large: "Large"
    },
    bodyOptions: {
      any: "No preference",
      hatchback: "Hatchback",
      sedan: "Sedan",
      suv: "SUV",
      wagon: "Estate",
      mpv: "Tall family car"
    },
    ownershipOptions: {
      lowest_cost: "Lowest cost",
      balanced: "Balanced overall",
      premium: "More equipment and range"
    },
    priorityOptions: {
      budget: "Price",
      range: "Range",
      charging: "Charging",
      space: "Space",
      efficiency: "Efficiency",
      comfort: "Comfort",
      performance: "Performance"
    },
    fieldHelp: {
      budget: {
        simple: "Use the number you would feel comfortable with before negotiation, finance, or trade-in.",
        advanced: "Used as both filter and scoring penalty. Prices can be new, used, or reference depending on available data."
      },
      purchase: {
        simple: "If you are still exploring, keep new or used so good options are not removed too early.",
        advanced: "Affects pricing.offers[] by condition/status and can favor official availability or used-market options."
      },
      charging: {
        simple: "Home or work charging makes ownership easier. If you rely on public charging, range and fast charging matter more.",
        advanced: "Changes the weight of DC kW, 10-80%, real range, and efficiency for frequent public-charging use."
      },
      dailyCommute: {
        simple: "Think of a normal day, not the longest day of the year. Long trips are handled separately.",
        advanced: "Compares daily use against estimated real range and penalizes weak range data."
      },
      people: {
        simple: "Count the people who regularly ride with you. This helps avoid cars that are too small.",
        advanced: "Cross-checks seats, segment, body style, and cargo capacity."
      },
      roadTrips: {
        simple: "The more long trips you do, the more motorway range and fast charging matter.",
        advanced: "Increases weight for motorway range, max DC kW, 10-80%, and data confidence."
      },
      cargo: {
        simple: "Think about luggage, child gear, large shopping, or equipment you carry often.",
        advanced: "Uses boot liters, body style, and dimensions data where available."
      },
      body: {
        simple: "If unsure, leave no preference. The recommender keeps more good options open.",
        advanced: "Applies bodyType/segment preference without fully blocking other strong options."
      },
      decisionStyle: {
        simple: "Say whether you want to save money, balance everything, or prioritize comfort/range/equipment.",
        advanced: "Adjusts weights between price, efficiency, comfort, range, charging, and performance."
      },
      priorities: {
        simple: "Choose what truly matters. Fewer priorities usually produce clearer recommendations.",
        advanced: "Each priority changes scoring weights. Keep only criteria you really want to optimize."
      }
    }
  },
  recommendResults: {
    emptyTitle: "No recommendations yet",
    emptyDescription: "Fill in the profile and run the analysis to compare the current catalog.",
    bestMatch: "Best match",
    topMatches: "Top 3",
    bestDescription: "{match}% compatibility with {confidence}. Below you can see why it was recommended, watch-outs, and strong alternatives."
  },
  recommendCard: {
    match: "match",
    unavailable: "N/A",
    fallbackSegment: "EV",
    fallbackBody: "Body N/A",
    fallbackDrivetrain: "Drivetrain N/A",
    monthlyEnergy: "month energy",
    belowBudget: "{amount} below budget",
    aboveBudget: "{amount} above budget",
    priceEstimate: "Estimated price",
    priceKinds: {
      new: "New from",
      used: "Used from",
      importedUsed: "Imported used from"
    },
    priceModelYear: "Model year {year}",
    priceYears: "Years {years}",
    realRange: "Real range",
    motorway: "Motorway",
    fastDc: "Fast DC",
    usableBattery: "Usable battery",
    charge10to80: "10-80%",
    consumption: "Consumption",
    trunk: "Boot",
    seats: "Seats",
    plainSpecs: {
      range: {
        label: "Everyday range",
        long: "Very relaxed, even for trips",
        good: "Good for routine and weekends",
        daily: "Good for daily use",
        limited: "May need planning",
        unknown: "No reliable data yet"
      },
      charging: {
        label: "Trip charging",
        fast: "Fast and comfortable",
        ok: "Good for most trips",
        slow: "May take longer on trips",
        unknown: "No reliable data yet"
      },
      cargo: {
        label: "Boot space",
        large: "Large for family and luggage",
        family: "Enough for family use",
        light: "Best for lighter use",
        unknown: "No reliable data yet"
      },
      efficiency: {
        label: "Expected consumption",
        veryGood: "Very efficient",
        good: "Balanced consumption",
        high: "May use more energy",
        unknown: "No reliable data yet"
      }
    },
    whyItFits: "Why it fits",
    watchOut: "Watch out",
    noRelevantAlerts: "No relevant alerts with the available data.",
    technicalScore: "Technical score",
    viewDetails: "View details",
    startComparison: "Start comparison",
    confidence: {
      high: "High confidence",
      medium: "Medium confidence",
      low: "Low confidence"
    },
    dataCoverage: "{coverage}% data"
  },
  recommendationEngine: {
    labels: {
      budget: "Budget",
      range: "Range",
      charging: "Charging",
      space: "Space",
      efficiency: "Efficiency",
      comfort: "Comfort",
      preference: "Preferences"
    },
    reasons: {
      priceUnavailable: "Price unavailable: kept as an option, but with lower confidence.",
      newPriceUnavailable: "No compatible confirmed new price is available for this version.",
      usedPriceUnavailable: "No compatible confirmed used price is available for this version.",
      comfortablyWithinBudget: "Comfortably within budget ({price}).",
      withinBudget: "Fits the defined budget ({price}).",
      slightlyAboveBudget: "Slightly above budget ({price}).",
      farAboveBudget: "Well above budget ({price}).",
      rangeUnavailable: "Real range unavailable: recommended with lower confidence.",
      rangeAdequate: "Range is suitable for your use ({range} km estimated).",
      rangeNeedsPlanning: "Range may require more planning ({range} km estimated).",
      chargingUnavailable: "Fast-charging data unavailable.",
      dcCharging: "DC charging up to {power} kW.",
      chargingTimeOnly: "Charging time looks acceptable, but DC power is not confirmed.",
      seatsAndTrunk: "{seats} seats and {trunk} L of boot space.",
      seatsOnly: "{seats} seats; boot data is still incomplete.",
      consumptionUnavailable: "Real consumption unavailable.",
      consumption: "Estimated consumption of {consumption} Wh/km.",
      comfortIncomplete: "Comfort data is still incomplete.",
      goodComfort: "Good comfort and technology package for daily use.",
      acceptableComfort: "Acceptable comfort, but some data or extras may be missing.",
      flexibleBody: "No strict body-style preference, so this keeps good flexibility.",
      bodyPreference: "Matches body-style preference: {body}."
    },
    tags: {
      withinBudget: "Within budget",
      bigBattery: "Big battery",
      fastCharging: "Fast charging",
      goodRange: "Good range",
      efficient: "Efficient",
      family: "Family friendly"
    }
  },
  quiz: {
    title: "EV Recommendation Quiz",
    subtitle: "Answer a few questions and get the best EV matches for your lifestyle.",
    budget: "Budget (€)",
    dailyCommute: "Daily Commute (km)",
    familySize: "Family size",
    homeCharging: "Home charging",
    roadTrips: "Road trip frequency",
    yes: "Yes",
    no: "No",
    never: "Never",
    sometimes: "Sometimes",
    often: "Often",
    loading: "Finding matches...",
    submit: "Get recommendations",
    topMatches: "Top 3 matches returned.",
    error: "Unable to load recommendations. Please try again."
  },
  results: {
    empty: "Submit the quiz to see your top EV matches."
  },
  aboutPage: {
    metadataTitle: "About",
    metadataDescription: "Meet MotorZero, a Portugal-first platform for exploring, comparing, and understanding electric vehicles.",
    title: "About",
    description: "MotorZero helps drivers in Portugal explore, compare, and understand electric vehicles with clear specifications, smart tools, and recommendations grounded in real-world use."
  },
  contactsPage: {
    metadataTitle: "Contact",
    metadataDescription: "Contact MotorZero for partnerships, data corrections, or feedback.",
    title: "Contact",
    description: "Reach out about partnerships, data corrections, suggestions, or feedback about the platform."
  },
  legalPages: {
    privacy: {
      metadataTitle: "Privacy Policy",
      metadataDescription: "How MotorZero handles personal data and usage information.",
      title: "Privacy Policy",
      description: "What data we process, why we process it, and your rights.",
      updated: "Last updated: June 9, 2026",
      sections: [
        { title: "Controller", paragraphs: ["MotorZero is responsible for data processed through motorzero.pt. For privacy questions, use the Contact page."] },
        { title: "Data and purposes", paragraphs: ["We may process information submitted voluntarily and technical usage data when you allow analytics.", "We use it to answer requests, maintain security, improve the service, and produce aggregated statistics. We do not sell personal data."] },
        { title: "Retention and rights", paragraphs: ["We retain data only for as long as required for its purpose or a legal obligation.", "You may request access, correction, deletion, restriction, objection, and, where applicable, portability. You can withdraw consent through Cookie settings."] }
      ]
    },
    cookies: {
      metadataTitle: "Cookie Policy",
      metadataDescription: "Cookies used by MotorZero and how to manage consent.",
      title: "Cookie Policy",
      description: "The cookie categories we use and how you can change your choice.",
      updated: "Last updated: June 9, 2026",
      sections: [
        { title: "Necessary", paragraphs: ["These support essential functions such as saving language and consent preferences."] },
        { title: "Analytics", paragraphs: ["With permission, Google Analytics 4 may create cookies such as _ga and _ga_* to measure visits. Without permission, analytics_storage remains denied."] },
        { title: "Marketing", paragraphs: ["This controls ad_storage, ad_user_data, and ad_personalization. We currently do not use Google Ads, Meta Pixel, or Microsoft Clarity."] },
        { title: "Changing your choice", paragraphs: ["You can reopen Cookie settings from the footer. Your choice is retained for 180 days and requested again when the policy changes or that period expires."] }
      ]
    },
    terms: {
      metadataTitle: "Terms of Use",
      metadataDescription: "Terms governing use of the MotorZero platform.",
      title: "Terms of Use",
      description: "Terms applying to MotorZero information and tools.",
      updated: "Last updated: June 9, 2026",
      sections: [
        { title: "Information", paragraphs: ["MotorZero provides comparative and educational information. Data may be incomplete, under validation, or subject to change."] },
        { title: "Prices and decisions", paragraphs: ["Prices, range, consumption, charging, and costs are references, not commercial offers. Always confirm final conditions with the relevant provider."] },
        { title: "Use and liability", paragraphs: ["Abusive automated extraction, interference with the service, or commercial reuse without permission is prohibited.", "We aim to keep information accurate and the service available, but cannot guarantee the absence of errors or interruptions."] }
      ]
    }
  },
  modelPage: {
    home: "Home",
    version: "version",
    versions: "versions",
    availableVersions: "Available versions",
    availableVersionsSubtitle: "Choose the version you want to explore in detail or compare them side-by-side.",
    compareAll: "Compare all versions",
    range: "WLTP Range",
    charging: "DC Charging",
    priceFrom: "Price",
    viewSpecs: "View specifications"
  },
  compareButton: {
    maxVehicles: "Maximum of 3 vehicles can be compared",
    inComparison: "In comparison",
    compare: "Compare"
  },
  comparePage: {
    loading: "Loading comparison...",
    home: "Home",
    compare: "Compare",
    result: "Result",
    editSelection: "Edit selection",
    unavailableTitle: "This comparison could not be created",
    loadError: "There was a problem loading the data. Try selecting the models or versions again.",
    missingSelection: "{count} of the selections is no longer available or has invalid data.",
    chooseAgain: "Choose again",
    tags: {
      budget: "Budget-conscious buyers",
      longDistance: "Long-distance travel",
      city: "City driving",
      families: "Families",
      adventure: "Adventure seekers",
      performance: "Performance enthusiasts",
      eco: "Eco-conscious drivers"
    }
  },
  comparisonBadges: {
    title: "Awards & Highlights",
    noHighlights: "No specific highlight in this comparison."
  },
  comparisonBar: {
    compare: "Compare",
    remove: "Remove",
    removeVehicle: "Remove from comparison",
    fromComparison: "from comparison",
    clearComparison: "Clear comparison",
    clearAll: "Clear all vehicles from comparison",
    selectOneMore: "Select one more vehicle to compare",
    readyToCompare: "Ready to compare! You can add 1 more",
    maxVehicles: "Maximum of 3 vehicles selected"
  },
  comparisonMetrics: {
    keySpecifications: "Key Specifications",
    additionalDetails: "Additional Details",
    keyMetric: "key",
    detailMetric: "detail",
    best: "BEST"
  },
  comparisonPage: {
    noComparison: "No comparison selected",
    selectAtLeastTwo: "Select at least 2 vehicles to compare specifications and features.",
    browseVehicles: "Browse vehicles",
    title: "EV Comparison",
    compare: "Compare",
    premiumVehicles: "electric vehicles side-by-side",
    range: "Range",
    price: "Price",
    battery: "Battery",
    modeLabel: "How do you want to compare?",
    simpleMode: "Simple",
    advancedMode: "Advanced",
    simpleModeDescription: "Shows clear winners and explains the practical impact of each difference.",
    advancedModeDescription: "Shows highlights, summary, and the full specifications table.",
    simpleDecisionTitle: "Quick decision view",
    simpleDecisionDescription: "For people who do not want to dig into specs: quickly see which car wins on price, range, charging, and space.",
    simpleWinner: "Result",
    simplePrice: "Lowest price found",
    simplePriceHelp: "Compares the available reference price, distinguishing new, used, or imported when the data exists.",
    simpleRange: "Best for less anxiety",
    simpleRangeHelp: "More range gives more margin for long days and trips with less planning.",
    simpleCharging: "Shortest charging stop",
    simpleChargingHelp: "Compares the estimated 10-80% fast-charging time, useful for road trips.",
    simpleSpace: "Best for family/load",
    simpleSpaceHelp: "More boot space helps with luggage, shopping, child gear, and equipment.",
    simpleStrongOption: "Strong pick",
    simpleRangeLabel: "Stress-free use",
    simpleChargingLabel: "Trip stops",
    simpleCargoLabel: "Everyday space",
    simplePriceContextUnknown: "Reference price",
    simpleWltpContext: "WLTP range",
    simpleDcChargeContext: "Fast charging 10-80%",
    simpleCargoContext: "Boot space with seats up",
    dcChargingPower: "Max DC power",
    acChargingPower: "Max AC power",
    chargingPlug: "Plug",
    rangeFeelings: {
      unknown: "No reliable data yet",
      relaxed: "Very comfortable for routine and trips",
      comfortable: "Easy for most days",
      planning: "Needs more planning on trips"
    },
    chargingFeelings: {
      unknown: "No reliable data yet",
      fast: "Short road-trip stops",
      ok: "Fine for occasional trips",
      slow: "May make trips slower"
    },
    cargoFeelings: {
      unknown: "No reliable data yet",
      large: "Easy for family and luggage",
      family: "Enough for family use",
      compact: "Best for lighter use"
    },
    readyDecision: "Ready to make a decision?",
    informedChoice: "Based on your comparison, explore detailed specifications and make an informed choice about your next EV.",
    backToVehicles: "Back to all models",
    viewVehicle: "View {vehicle}",
    backToResults: "Back to comparison results",
    testDrive: "Schedule a test drive"
  },
  comparisonSummary: {
    title: "Comparison summary",
    bestValue: "Lowest price",
    bestRange: "Best range",
    fastestCharging: "Fastest charging",
    mostEfficient: "Most efficient",
    recommendation: "Practical takeaway",
    bestFor: "Best for",
    keyHighlights: "Key highlights",
    startingPrice: "Reference price",
    wltpRange: "WLTP range",
    battery: "Battery"
  },
  vehicleSelector: {
    loading: "Loading vehicles...",
    title: "Choose vehicles to compare",
    description: "Select 2 or 3 models, even from different brands. Switch to versions when you want to compare specific variants.",
    modelMode: "Models",
    versionMode: "Versions",
    selected: "Selected",
    maxVehicles: "Maximum 3 vehicles",
    select: "Select",
    noneSelected: "No vehicles selected — choose at least 2 vehicles.",
    selectedCount: "of 3 selected",
    selectedCount2: "of 3 selected:",
    remove: "Remove",
    compareNow: "Compare now",
    selectOneMore: "Select one more vehicle to compare.",
    ready: "Ready to compare. You can still swap or add another vehicle.",
    searchLabel: "Search model",
    searchPlaceholder: "Brand, model, version...",
    brandFilter: "Brand",
    bodyFilter: "Body style",
    allBrands: "All brands",
    allBodies: "All body styles",
    resultsCount: "models found",
    modelResultsCount: "models found",
    versionResultsCount: "versions found",
    versionAvailable: "version available",
    versionsAvailable: "versions available"
  },
  batteryAndCharging: {
    title: "Battery & Charging",
    usableBattery: "Usable Battery",
    grossBattery: "Gross Battery",
    chemistry: "Chemistry",
    dcCharging: "DC Charging",
    acCharging: "AC Charging",
    voltage: "Voltage",
    features: "Features",
    plugAndCharge: "Plug & Charge",
    teslaSupercharger: "Tesla Supercharger"
  },
  comfortAndFeatures: {
    title: "Comfort & Features",
    features: "Features",
    ratings: "Ratings",
    heatPump: "Heat Pump",
    vehicleToLoad: "Vehicle to Load",
    vehicleToGrid: "Vehicle to Grid",
    panoramicRoof: "Panoramic Roof",
    softwareExperience: "Software Experience",
    maintenance: "Maintenance",
    insurance: "Insurance"
  },
  dimensions: {
    title: "Dimensions & Storage",
    exteriorDimensions: "Exterior Dimensions",
    storageAndSpace: "Storage & Space",
    comfort: "Comfort",
    summary: "Vehicle Summary",
    length: "Length",
    width: "Width",
    height: "Height",
    wheelbase: "Wheelbase",
    trunkSeatsUp: "Trunk (Seats Up)",
    trunkSeatsDown: "Trunk (Seats Down)",
    frunk: "Frunk",
    rearLegroom: "Rear Legroom",
    rearPassengers: "Space for rear passengers",
    overallSize: "Overall size:",
    cargoSpace: "Cargo space:",
    long: "long",
    wide: "wide",
    seatsUp: "with rear seats up",
    seatsDown: "with seats down"
  },
  vehicleComparison: {
    title: "Add to comparison",
    inSelection: "This vehicle is in your selection",
    of3: "of 3",
    description: "Compare with other models to decide with confidence.",
    viewComparison: "View comparison"
  },
  efficiency: {
    title: "Range & Efficiency",
    range: "Range",
    wltpRange: "WLTP Range",
    realWorldRange: "Real-World Range",
    motorwayRange: "Motorway Range",
    wltpContext: "Standardized test cycle",
    realWorldContext: "Estimated typical driving",
    motorwayContext: "Driving at 120 km/h",
    energyConsumption: "Energy Consumption",
    realWorldConsumption: "Real-World Consumption",
    motorwayConsumption: "Motorway Consumption",
    realWorldConsumptionContext: "Typical mixed driving",
    motorwayConsumptionContext: "Highway driving",
    summary: "Efficiency Summary",
    summaryText: "This vehicle achieves approximately",
    summaryEfficiency: "of real-world efficiency.",
    motorwaySummary: "Estimated motorway range is"
  },
  generic: {
    yes: "Yes",
    no: "No",
    na: "N/A"
  },
  pricing: {
    title: "Pricing",
    marketPrices: "Portugal market prices",
    updated: "Updated:",
    consumerPrice: "Consumer Price",
    businessPrice: "Business (ex VAT)",
    usedVehicle: "Used Vehicle",
    expectedSavings: "Expected savings:",
    usedSavingsText: "Used vehicles typically offer",
    overNew: "savings over new.",
    to: "to",
    source: "Source",
    date: "Date",
    context: "Context",
    confidence: "Confidence",
    sourceNotSet: "Source to confirm",
    priceNote: "Note",
    confidenceValues: {
      high: "High",
      medium: "Medium",
      low: "Low",
      unknown: "To confirm"
    },
    sourceTypes: {
      official_brand: "Official price",
      dealer: "Dealer",
      classifieds: "Classifieds",
      market_estimate: "Market estimate",
      manual: "Manual review",
      unknown: "Unknown source"
    }
  },
  specsGrid: {
    title: "Specifications",
    brand: "Brand",
    model: "Model",
    variant: "Variant",
    modelYear: "Model Year",
    doors: "Doors",
    seats: "Seats",
    length: "Length",
    width: "Width",
    height: "Height",
    wheelbase: "Wheelbase"
  },
  vehicleImage: {
    comingSoon: "Image Coming Soon"
  },
  recommendationlib: {
    fitsBudget: "Fits comfortably within your budget of",
    closeBudget: "Close to your budget with used pricing",
    premiumPricing: "Premium pricing for a specific fit",
    noHomeChargingFast: "Since you do not have home charging, this vehicle's very fast charging is a major advantage",
    strongDcCharging: "Strong DC charging for no-home-charging living",
    efficientPublicCharging: "Efficient enough for frequent public charging",
    excellentRoadTrips: "Excellent fit for frequent long trips with fast charging",
    goodRoadTrips: "Good charging performance for road trips",
    commuteCovered: "Your daily commute is easily covered even in winter conditions",
    commutePossible: "Range should cover your daily commute",
    familyBattery: "Good battery capacity for family driving",
    veryFastCharging: "Very fast charging for longer trips",
    tags: {
      families: "Best for families",
      apartment: "Best for apartment charging",
      roadTrips: "Best for road trips",
      budget: "Best budget option",
      commuter: "Efficient commuter"
    },
    drawbacks: {
      highPrice: "Higher purchase price",
      limitedRange: "Limited range for your commute",
      slowerCharging: "Slower charging without home charger",
      smallBattery: "Smaller battery for larger families"
    }
  },
  comparison: {
    labels: {
      bestRange: "Best Range",
      longestRange: "Longest WLTP range",
      bestValue: "Lowest price",
      affordableComparison: "Lowest reference price in this comparison",
      fastestCharging: "Fastest Charging",
      chargeTime: "10-80% charge time",
      mostEfficient: "Most Efficient",
      efficiencyDescription: "Best kWh/100km",
      fastest: "Fastest",
      acceleration: "0-100 km/h acceleration",
      startingPrice: "Price considered",
      wltpRange: "WLTP Range",
      batteryCapacity: "Battery Capacity",
      wltpConsumption: "WLTP Consumption",
      maxDcCharging: "Max DC Charging Speed",
      chargingTime: "10-80% Charging Time",
      acceleration0100: "Acceleration 0-100 km/h",
      horsepower: "Horsepower",
      seatingCapacity: "Seating Capacity",
      trunkCapacity: "Trunk Capacity",
      length: "Length"
    },
    values: {
      seats: "seats",
      minutes: "min",
      seconds: "s",
      kwh100km: "kWh/100km",
      km: "km",
      euros: "€"
    },
    recommendation: {
      default: "There is no universal winner: use the metrics below to choose the best compromise for your needs.",
      twoVehicles: "The lowest price is offered by {bestValue}; the longest range is offered by {bestRange}. Check charging, space, and missing data before deciding.",
      sameLeader: "{vehicle} combines the lowest price and longest range in this comparison. Also check charging, space, and data quality.",
      multiMetricLeader: "{vehicle} leads {count} of the four main metrics. The remaining differences may still be decisive for your needs.",
      tradeOff: "There is no clear winner: the strengths are shared across the vehicles. Choose based on the metrics that matter most to you.",
      tie: "Tie"
    }
  },
  footer: {
    description: "MotorZero helps everyday drivers make better decisions about electric vehicles through simple comparisons, practical insights and easy-to-understand information.",
    subdescription: "From your very first electric car to your next one, stress-free.",
    explore: "Explore",
    findYourEv: "Find Your EV",
    compareVehicles: "Compare Vehicles",
    browseModels: "Browse Models",
    buyingGuides: "Buying Guides",
    charging: "Charging",
    other: "Other",
    about: "About",
    contacts: "Contacts",
    language: "Language",
    privacy: "Privacy",
    terms: "Terms",
    cookies: "Cookies",
    cookieSettings: "Cookie settings"
  },
  cookieConsent: {
    title: "Your privacy",
    description: "We use optional cookies to measure how MotorZero is used and improve the experience. You can accept, reject, or choose by category.",
    preferencesDescription: "Choose which optional categories you allow. Necessary cookies are always active so the website can work.",
    analytics: "Analytics",
    analyticsDescription: "Helps us understand how the website is used.",
    marketing: "Marketing",
    marketingDescription: "Allows advertising measurement and personalisation. We do not use advertising platforms yet.",
    acceptAll: "Accept all",
    rejectAll: "Reject all",
    managePreferences: "Manage preferences",
    savePreferences: "Save preferences"
  },
  models: {
    catalog: "Catalog",
    title: "All Electric Models",
    description: "Choose a model to explore all available variants, pricing, and specifications.",
    noImage: "No image",
    version: "version",
    versions: "versions"
  },
  modelsExplorer: {
    searchLabel: "Search models",
    searchPlaceholder: "Search brand, model, SUV, city, family...",
    sortLabel: "Sort",
    showFilters: "Advanced filters",
    hideFilters: "Hide filters",
    clearFilters: "Clear",
    resultModels: "{count} models found",
    resultVariants: "{count} versions found",
    dataComplete: "Complete data",
    dataValidating: "Data validating",
    stats: {
      models: "Models",
      versions: "Versions",
      brands: "Brands",
      priceFrom: "Lowest price",
      bestRange: "Best range"
    },
    tabs: {
      models: "Explore models",
      variants: "Compare versions"
    },
    intent: {
      budget: "Lowest price",
      family: "For families",
      city: "City",
      longTrips: "Long trips",
      suv: "SUV",
      fastCharging: "Fast charging",
      firstEv: "First EV",
      range: "Best range"
    },
    sort: {
      recommended: "Recommended",
      priceAsc: "Lowest price",
      rangeDesc: "Best range",
      chargingDesc: "Fastest charging",
      efficiencyAsc: "Most efficient",
      newest: "Newest",
      completeDesc: "Most complete data",
      az: "A-Z"
    },
    filters: {
      brand: "Brand",
      body: "Body",
      maxPrice: "Max price",
      minRange: "Minimum range",
      minDc: "Minimum DC",
      data: "Data",
      allBrands: "All brands",
      allBodies: "All",
      anyPrice: "Any price",
      anyRange: "Any range",
      anyCharging: "Any charging",
      allData: "All",
      complete: "Complete",
      validating: "Validating"
    },
    card: {
      priceFrom: "Price",
      rangeUpTo: "Up to",
      fastCharging: "DC",
      viewVersions: "View versions",
      compare: "Compare"
    },
    price: {
      priceValidating: "Price validating",
      noConfirmedPrice: "No confirmed price",
      modelYear: "Model year {year}",
      years: "Years {years}",
      updated: "Updated {date}",
      legacy: "legacy format",
      importCostsNotIncluded: "PT costs not included",
      kind: {
        new: "New from",
        used: "Used from",
        importedUsed: "Imported used from",
        referenceNew: "Reference new price"
      }
    },
    variantTable: {
      version: "Version",
      price: "Price",
      range: "Range",
      charging: "DC",
      battery: "Battery",
      data: "Data"
    }
  },
  model: {
    notFoundTitle: "Model not found",
    description: "Compare the {count} variants of {model}. Range, charging, and pricing."
  },
  vehicle: {
    evPlatform: "EV Platform",
    notFoundTitle: "Vehicle not found",
    fallbackName: "Vehicle",
    description: "Detailed specifications for {vehicle}.",
    allVersionsOf: "All versions of {model}"
  },
  compare: {
    metadataTitle: "EV Comparison",
    metadataDescription: "Compare up to 3 electric vehicles side by side.",
    modelsMetadataTitle: "Compare electric car models",
    modelsMetadataDescription: "Compare electric car model families across brands before choosing a version.",
    versionsMetadataTitle: "Compare electric car versions",
    versionsMetadataDescription: "Compare specific electric car versions, prices, range, and charging."
  }
}
