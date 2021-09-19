import axios from "axios";
import TrieSearch from "trie-search";
import { CourseRequirement } from "../../models/courseRequirementModel";
import * as download from "downloadjs";
import { v4 as uuidv4 } from "uuid";
import { backend_api } from "../../backendAPI";

const mathCourses = [
  "ACTSC",
  "AMATH",
  "CO",
  "COMM",
  "CS",
  "MATH",
  "MTHEL",
  "MATBUS",
  "PMATH",
  "SE",
  "STATE"
];
const nonMathCourses = [
  "AFM",
  "ASL",
  "ANTH",
  "AHS",
  "APPLS",
  "ARABIC",
  "AE",
  "ARCH",
  "ARTS",
  "ARBUS",
  "AVIA",
  "BIOL",
  "BME",
  "BASE",
  "BUS",
  "BET",
  "CDNST",
  "CHE",
  "CHEM",
  "CHINA",
  "CMW",
  "CIVE",
  "CLAS",
  "COGSCI",
  "CROAT",
  "CI",
  "DAC",
  "DUTCH",
  "EARTH",
  "EASIA",
  "ECON",
  "ECE",
  "ENGL",
  "EMLS",
  "ENBUS",
  "ERS",
  "ENVE",
  "ENVS",
  "FINE",
  "FR",
  "GSJ",
  "GENE",
  "GEOG",
  "GEOE",
  "GER",
  "GERON",
  "GBDA",
  "GRK",
  "HLTH",
  "HIST",
  "HRM",
  "HRTS",
  "HUMSC",
  "INDG",
  "INDEV",
  "INTST",
  "ITAL",
  "ITALST",
  "JAPAN",
  "JS",
  "KIN",
  "INTEG",
  "KOREA",
  "LAT",
  "LS",
  "MGMT",
  "MSCI",
  "MNS",
  "ME",
  "MTE",
  "MEDVL",
  "MENN",
  "MOHAWK",
  "MUSIC",
  "NE",
  "OPTOM",
  "PACS",
  "PHARM",
  "PHIL",
  "PHYS",
  "PLAN",
  "PSCI",
  "PORT",
  "PSYCH",
  "PMATH",
  "REC",
  "RS",
  "RUSS",
  "REES",
  "SCI",
  "SCBUS",
  "SMF",
  "SDS",
  "SVENT",
  "SOCWK",
  "SWREN",
  "STV",
  "SOC",
  "SPAN",
  "SPCOM",
  "SI",
  "SYDE",
  "THPERF",
  "VCULT"
];
const scienceCourses = [
  "BIOL",
  "CHEM",
  "EARTH",
  "MNS",
  "OPTOM",
  "PHARM",
  "PHYS",
  "SCI",
  "SCBUS"
];
const electiveCourses = [
  "ACTSC",
  "AMATH",
  "CO",
  "COMM",
  "CS",
  "MATH",
  "MTHEL",
  "MATBUS",
  "PMATH",
  "SE",
  "STATE",
  "NON-MATH",
  "AFM",
  "ASL",
  "ANTH",
  "AHS",
  "APPLS",
  "ARABIC",
  "AE",
  "ARCH",
  "ARTS",
  "ARBUS",
  "AVIA",
  "BIOL",
  "BME",
  "BASE",
  "BUS",
  "BET",
  "CDNST",
  "CHE",
  "CHEM",
  "CHINA",
  "CMW",
  "CIVE",
  "CLAS",
  "COGSCI",
  "CROAT",
  "CI",
  "DAC",
  "DUTCH",
  "EARTH",
  "EASIA",
  "ECON",
  "ECE",
  "ENGL",
  "EMLS",
  "ENBUS",
  "ERS",
  "ENVE",
  "ENVS",
  "FINE",
  "FR",
  "GSJ",
  "GENE",
  "GEOG",
  "GEOE",
  "GER",
  "GERON",
  "GBDA",
  "GRK",
  "HLTH",
  "HIST",
  "HRM",
  "HRTS",
  "HUMSC",
  "INDG",
  "INDEV",
  "INTST",
  "ITAL",
  "ITALST",
  "JAPAN",
  "JS",
  "KIN",
  "INTEG",
  "KOREA",
  "LAT",
  "LS",
  "MGMT",
  "MSCI",
  "MNS",
  "ME",
  "MTE",
  "MEDVL",
  "MENN",
  "MOHAWK",
  "MUSIC",
  "NE",
  "OPTOM",
  "PACS",
  "PHARM",
  "PHIL",
  "PHYS",
  "PLAN",
  "PSCI",
  "PORT",
  "PSYCH",
  "PMATH",
  "REC",
  "RS",
  "RUSS",
  "REES",
  "SCI",
  "SCBUS",
  "SMF",
  "SDS",
  "SVENT",
  "SOCWK",
  "SWREN",
  "STV",
  "SOC",
  "SPAN",
  "SPCOM",
  "SI",
  "SYDE",
  "THPERF",
  "VCULT"
];
const languageCourses = [
  "ARABIC",
  "CHINA",
  "CROAT",
  "DUTCH",
  "FR",
  "GER",
  "GRK",
  "ITAL",
  "JAPAN",
  "KOREA",
  "LAT",
  "PORT",
  "RUSS",
  "SPAN"
];

const defaultTable = [
  {
    courses: []
  },
  {
    courses: []
  },
  {
    courses: []
  },
  {
    courses: []
  },
  {
    courses: []
  },
  {
    courses: []
  },
  {
    courses: []
  },
  {
    courses: []
  }
];

const state = {
  table: JSON.parse(JSON.stringify(defaultTable)),
  checklistMajorRequirements: {},
  checklistMinorRequirements: {},
  checklistOptionRequirements: {},
  cacheTime: 0
};

const getters = {
  checklistMajorRequirements: state => state.checklistMajorRequirements,
  checklistMinorRequirements: state => state.checklistMinorRequirements,
  checklistOptionRequirements: state => state.checklistOptionRequirements,
  getTable: state => state.table,
  getCourse: state => (termIndex, courseIndex) => {
    return state.table[termIndex].courses[courseIndex];
  },
  cacheTime: state => state.cacheTime
};

function getRequirementFulfillmentSize(req_course_codes) {
  let required_courses = req_course_codes.split(/,\s|\sor\s/);
  let sizeScore = 0;
  for (let course of required_courses) {
    if (course[course.length - 1] === "-") {
      sizeScore += 50;
    } else if (
      course.split("-").length === 2 &&
      course.split("-")[0].length > 0 &&
      course.split("-")[1].length > 0
    ) {
      sizeScore += 30;
    } else {
      if (course === "SCIENCE" || course === "LANGUAGE" || course === "MATH") {
        sizeScore += 200;
      } else if (course === "NON-MATH") {
        sizeScore += 500;
      } else if (course === "Elective") {
        sizeScore += 1000;
      } else {
        sizeScore += 1;
      }
    }
  }
  return sizeScore;
}

function sortRequirementsByYear(requirements) {
  requirements.sort((req1, req2) => {
    var req1DateScore = 0;
    var req2DateScore = 0;
    if (req1.year == 1 || req1.year == 5) {
      req1DateScore = 2;
    } else if (req1.year == 2 || req1.year == 6) {
      req1DateScore = 5;
    } else if (req1.year == 3 || req1.year == 7) {
      req1DateScore = 8;
    } else if (req1.year == 4 || req1.year == 8) {
      req1DateScore = 11;
    } else if (req1.year == 9) req1DateScore = 5;
    else if (req1.year == 9) req1DateScore = 1;
    else if (req1.year == 10) req1DateScore = 3;
    else if (req1.year == 11) req1DateScore = 4;
    else if (req1.year == 12) req1DateScore = 6;
    else if (req1.year == 13) req1DateScore = 7;
    else if (req1.year == 14) req1DateScore = 9;
    else if (req1.year == 15) req1DateScore = 10;
    else if (req1.year == 16) req1DateScore = 12;
    else if (req1.year == -1) req1DateScore = 13;

    if (req2.year == 1 || req2.year == 5) {
      req2DateScore = 2;
    } else if (req2.year == 2 || req2.year == 6) {
      req2DateScore = 5;
    } else if (req2.year == 3 || req2.year == 7) {
      req2DateScore = 8;
    } else if (req2.year == 4 || req2.year == 8) {
      req2DateScore = 11;
    } else if (req2.year == 9) req2DateScore = 1;
    else if (req2.year == 10) req2DateScore = 3;
    else if (req2.year == 11) req2DateScore = 4;
    else if (req2.year == 12) req2DateScore = 6;
    else if (req2.year == 13) req2DateScore = 7;
    else if (req2.year == 14) req2DateScore = 9;
    else if (req2.year == 15) req2DateScore = 10;
    else if (req2.year == 16) req2DateScore = 12;
    else if (req2.year == -1) req2DateScore = 13;

    if (req1DateScore < req2DateScore) return -1;
    else if (req1DateScore > req2DateScore) return 1;
    return 0;
  });

  return requirements;
}

function ParseRequirementsForChecklist(
  requirements,
  selectedCourses,
  programInfo,
  unselectedCourses
) {
  let usedSelectedCourses = new TrieSearch(
    [
      ["selected_course", "course_code"],
      ["selected_course", "course_number"]
    ],
    {
      idFieldOrFunction: function getID(req) {
        return req.selected_course.course_id;
      }
    }
  );
  let usedUnselectedCourses = new TrieSearch(["course_codes_raw"], {
    idFieldOrFunction: function getID(req) {
      return req.id;
    }
  });
  requirements = requirements.map(req => new CourseRequirement(req));
  // Since a single course could apply to multiple different requirements, we need to keep track of
  // courses that we have already "used up" to fulfill another requirement. This way we dont double count any courses.
  // We should prioritize requirements that have smaller subsets of possible courses to fill them.
  requirements.sort((req1, req2) => {
    let req1Score = getRequirementFulfillmentSize(req1.course_codes_raw);
    let req2Score = getRequirementFulfillmentSize(req2.course_codes_raw);
    req1.sizeScore = req1Score;
    req2.sizeScore = req2Score;
    if (req1Score < req2Score) return -1;
    else if (req1Score > req2Score) return 1;
    return 0;
  });
  let parsed_requirements = [];
  // Make first pass on requirements to see if any are fulfilled
  for (let requirement of requirements) {
    if (requirement.checklistOverride || !requirement.consume_course) continue;
    let required_courses = requirement.course_codes_raw.split(",");
    let numMatchedCredits = 0;
    let matchedSelectedCourses = [];
    let matchedUnselectedCourses = [];

    // See if any unselected requirements match
    let unselectedMatches = unselectedCourses
      .get(requirement.course_codes_raw)
      .filter(match => match.course_codes_raw === requirement.course_codes_raw);
    let usedUnselectedMatches = usedUnselectedCourses
      .get(requirement.course_codes_raw)
      .filter(match => match.course_codes_raw === requirement.course_codes_raw);
    if (unselectedMatches.length - usedUnselectedMatches.length > 0) {
      let unselectedCreditsUsed = Math.min(
        0.5 * (unselectedMatches.length - usedUnselectedMatches.length),
        requirement.credits_required
      );
      numMatchedCredits += unselectedCreditsUsed;
      matchedUnselectedCourses = matchedUnselectedCourses.concat(
        unselectedMatches.slice(0, unselectedCreditsUsed * 2)
      );
    }

    for (let course of required_courses) {
      course = course.trim();
      if (
        matchedSelectedCourses.length + matchedUnselectedCourses.length > 0 &&
        (numMatchedCredits >= requirement.credits_required ||
          (required_courses.length === 1 &&
            required_courses[0][required_courses[0].length - 1] === "L"))
      ) {
        break;
      }
      let a = true;
      let possibleMatches = [];
      if (course === "Elective") {
        possibleMatches = selectedCourses.get(electiveCourses);
      } else if (course === "LANGUAGE") {
        possibleMatches = selectedCourses.get(languageCourses);
      } else if (course === "MATH") {
        possibleMatches = selectedCourses.get(mathCourses);
      } else if (course === "NON-MATH") {
        possibleMatches = selectedCourses.get(nonMathCourses);
      } else if (course === "SCIENCE") {
        possibleMatches = selectedCourses.get(scienceCourses);
      } else if (course[course.length - 1] === "-") {
        // Handles X00's case, eg PHYS 300-, SCIENCE 300-, etc
        let courseSearchParams = [course.split(" ")[0]];
        if (course.split(" ")[0] === "SCIENCE") {
          courseSearchParams = scienceCourses;
        } else if (course.split(" ")[0] === "MATH") {
          courseSearchParams = mathCourses;
        } else if (course.split(" ")[0] === "NON-MATH") {
          courseSearchParams = nonMathCourses;
        }
        for (let searchParam of courseSearchParams) {
          possibleMatches = possibleMatches.concat(
            selectedCourses.get(
              [searchParam, course.split(" ")[1][0]],
              TrieSearch.UNION_REDUCER
            )
          );
        }
      } else if (
        course.split("-").length === 2 &&
        course.split("-")[0].length > 0 &&
        course.split("-")[1].length > 0
      ) {
        // Handles range case, eg CS 440-CS 498 (NOTE: Does not handle SCIENCE 440-SCIENCE 498 etc)
        let start = Math.floor(course.split("-")[0].split(" ")[1] / 100);
        let end = Math.floor(course.split("-")[1].split(" ")[1] / 100);
        for (let i = start; i <= end; i++) {
          possibleMatches = possibleMatches.concat(
            selectedCourses.get(
              [course.split("-")[0].split(" ")[0], i.toString()],
              TrieSearch.UNION_REDUCER
            )
          );
        }
        for (let match of possibleMatches) {
          if (
            match.selected_course.course_number <=
              course.split("-")[1].split(" ")[1] &&
            match.selected_course.course_number >=
              course.split("-")[0].split(" ")[1] &&
            usedSelectedCourses.get(match.selected_course.course_code)
              .length === 0
          ) {
            numMatchedCredits += match.selected_course.credit;
            matchedSelectedCourses.push(match);
            if (
              matchedSelectedCourses.length + matchedUnselectedCourses.length >
                0 &&
              (numMatchedCredits >= requirement.credits_required ||
                (required_courses.length === 1 &&
                  required_courses[0][required_courses[0].length - 1] === "L"))
            ) {
              break;
            }
          }
        }
        a = false;
      } else {
        let possibleMatches = selectedCourses.get(course);
        for (let match of possibleMatches) {
          if (
            usedSelectedCourses.get(match.selected_course.course_code)
              .length === 0 &&
            course === match.selected_course.course_code
          ) {
            numMatchedCredits += match.selected_course.credit;
            matchedSelectedCourses.push(selectedCourses.get(course)[0]);
            break;
          }
        }
        a = false;
      }
      if (a) {
        for (let match of possibleMatches) {
          if (
            usedSelectedCourses.get(match.selected_course.course_code)
              .length === 0
          ) {
            numMatchedCredits += match.selected_course.credit;
            matchedSelectedCourses.push(match);
            if (
              matchedSelectedCourses.length + matchedUnselectedCourses.length >
                0 &&
              (numMatchedCredits >= requirement.credits_required ||
                (required_courses.length === 1 &&
                  required_courses[0][required_courses[0].length - 1] === "L"))
            ) {
              break;
            }
          }
        }
      }
      if (
        (numMatchedCredits >= requirement.credits_required &&
          matchedSelectedCourses.length + matchedUnselectedCourses.length >
            0) ||
        (required_courses.length === 1 && matchedSelectedCourses.length >= 1)
      )
        break;
    }

    if (
      matchedSelectedCourses.length + matchedUnselectedCourses.length > 0 &&
      (numMatchedCredits >= requirement.credits_required ||
        (required_courses.length === 1 &&
          required_courses[0][required_courses[0].length - 1] === "L"))
    ) {
      requirement.prereqs_met = true;
      requirement.credits_of_prereqs_met = requirement.credits_required;
      usedSelectedCourses.addAll(matchedSelectedCourses);
      usedUnselectedCourses.addAll(matchedUnselectedCourses);
      for (let match of matchedSelectedCourses) {
        if (programInfo.plan_type === "Major") {
          match.satisfiesMajorReq = true;
        } else if (programInfo.plan_type === "Minor") {
          match.satisfiesMinorReq = true;
        } else if (programInfo.plan_type === "Specialization") {
          match.satisfiesSpecializationReq = true;
        }
      }
    } else if (
      matchedSelectedCourses.length + matchedUnselectedCourses.length > 0 &&
      numMatchedCredits > 0 &&
      requirement.sizeScore <= 15
    ) {
      requirement.prereqs_met = false;
      requirement.credits_of_prereqs_met = numMatchedCredits;
      usedSelectedCourses.addAll(matchedSelectedCourses);
      usedUnselectedCourses.addAll(matchedUnselectedCourses);
      for (let match of matchedSelectedCourses) {
        if (programInfo.plan_type === "Major") {
          match.satisfiesMajorReq = true;
        } else if (programInfo.plan_type === "Minor") {
          match.satisfiesMinorReq = true;
        } else if (programInfo.plan_type === "Specialization") {
          match.satisfiesSpecializationReq = true;
        }
      }
    } else {
      requirement.credits_of_prereqs_met = 0;
      requirement.prereqs_met = false;
    }
  }
  // Make second pass on requirements to match any remaining courses
  for (let requirement of requirements) {
    if (
      requirement.prereqs_met ||
      requirement.checklistOverride ||
      !requirement.consume_course
    ) {
      parsed_requirements.push(requirement);
      continue;
    }
    let required_courses = requirement.course_codes_raw.split(/,\s|\sor\s/);
    let matchedSelectedCourses = [];
    let matchedUnselectedCourses = [];

    // See if any unselected requirements match
    let unselectedMatches = unselectedCourses
      .get(requirement.course_codes_raw)
      .filter(match => match.course_codes_raw === requirement.course_codes_raw);
    let usedUnselectedMatches = usedUnselectedCourses
      .get(requirement.course_codes_raw)
      .filter(match => match.course_codes_raw === requirement.course_codes_raw);
    if (unselectedMatches.length - usedUnselectedMatches.length > 0) {
      let unselectedCreditsUsed = Math.min(
        0.5 * (unselectedMatches.length - usedUnselectedMatches.length),
        requirement.credits_required
      );
      requirement.credits_of_prereqs_met += unselectedCreditsUsed;
      usedUnselectedCourses.addAll(
        unselectedMatches.slice(0, unselectedCreditsUsed * 2)
      );
      matchedUnselectedCourses = matchedUnselectedCourses.concat(
        unselectedMatches.slice(0, unselectedCreditsUsed * 2)
      );
    }

    for (let course of required_courses) {
      let possibleMatches = [];
      let a = true;
      if (course === "Elective") {
        possibleMatches = selectedCourses.get(electiveCourses);
      } else if (course === "LANGUAGE") {
        possibleMatches = selectedCourses.get(languageCourses);
      } else if (course === "MATH") {
        possibleMatches = selectedCourses.get(mathCourses);
      } else if (course === "NON-MATH") {
        possibleMatches = selectedCourses.get(nonMathCourses);
      } else if (course === "SCIENCE") {
        possibleMatches = selectedCourses.get(scienceCourses);
      } else if (course[course.length - 1] === "-") {
        // Handles X00's case, eg PHYS 300-, SCIENCE 300-, etc
        let courseSearchParams = [course.split(" ")[0]];
        if (course.split(" ")[0] === "SCIENCE") {
          courseSearchParams = scienceCourses;
        } else if (course.split(" ")[0] === "MATH") {
          courseSearchParams = mathCourses;
        } else if (course.split(" ")[0] === "NON-MATH") {
          courseSearchParams = nonMathCourses;
        }
        for (let searchParam of courseSearchParams) {
          possibleMatches = possibleMatches.concat(
            selectedCourses.get(
              [searchParam, course.split(" ")[1][0]],
              TrieSearch.UNION_REDUCER
            )
          );
        }
      } else if (
        course.split("-").length === 2 &&
        course.split("-")[0].length > 0 &&
        course.split("-")[1].length > 0
      ) {
        // Handles range case, eg CS 440-CS 498
        let start = Math.floor(course.split("-")[0].split(" ")[1] / 100);
        let end = Math.floor(course.split("-")[1].split(" ")[1] / 100);
        for (let i = start; i <= end; i++) {
          possibleMatches = possibleMatches.concat(
            selectedCourses.get(
              [course.split("-")[0].split(" ")[0], i.toString()],
              TrieSearch.UNION_REDUCER
            )
          );
        }
        for (let match of possibleMatches) {
          if (
            match.selected_course.course_number <=
              course.split("-")[1].split(" ")[1] &&
            match.selected_course.course_number >=
              course.split("-")[0].split(" ")[1] &&
            usedSelectedCourses.get(match.selected_course.course_code)
              .length === 0
          ) {
            requirement.credits_of_prereqs_met += match.selected_course.credit;
            matchedSelectedCourses.push(match);
            usedSelectedCourses.add(match);
            if (
              matchedSelectedCourses.length + matchedUnselectedCourses.length >
                0 &&
              (requirement.credits_of_prereqs_met >=
                requirement.credits_required ||
                (required_courses.length === 1 &&
                  required_courses[0][required_courses[0].length - 1] === "L"))
            ) {
              break;
            }
          }
        }
        a = false;
      } else {
        // Handles normal course case, ege MATH 239
        let possibleMatches = selectedCourses.get(course);
        for (let match of possibleMatches) {
          if (
            usedSelectedCourses.get(match.selected_course.course_code)
              .length === 0 &&
            match.selected_course &&
            match.selected_course.course_code === course
          ) {
            matchedSelectedCourses.push(selectedCourses.get(course)[0]);
            usedSelectedCourses.add(match);
            requirement.credits_of_prereqs_met += match.selected_course.credit;
            break;
          }
        }
        a = false;
      }
      if (a) {
        for (let match of possibleMatches) {
          if (
            usedSelectedCourses.get(match.selected_course.course_code)
              .length === 0
          ) {
            requirement.credits_of_prereqs_met += match.selected_course.credit;
            matchedSelectedCourses.push(match);
            usedSelectedCourses.add(match);
            if (
              matchedSelectedCourses.length + matchedUnselectedCourses.length >
                0 &&
              (requirement.credits_of_prereqs_met >=
                requirement.credits_required ||
                (required_courses.length === 1 &&
                  required_courses[0][required_courses[0].length - 1] === "L"))
            ) {
              break;
            }
          }
        }
      }
      if (
        requirement.credits_of_prereqs_met >= requirement.credits_required &&
        matchedSelectedCourses.length + matchedUnselectedCourses.length > 0
      )
        break;
    }

    for (let match of matchedSelectedCourses) {
      if (programInfo.plan_type === "Major") {
        match.satisfiesMajorReq = true;
      } else if (programInfo.plan_type === "Minor") {
        match.satisfiesMinorReq = true;
      } else if (programInfo.plan_type === "Specialization") {
        match.satisfiesSpecializationReq = true;
      }
    }
    parsed_requirements.push(requirement);
  }
  parsed_requirements = sortRequirementsByYear(parsed_requirements);

  return parsed_requirements;
}

function getCoursesTable(state) {
  let course_table = [];
  for (let i = 0; i < state.table.length; i++) {
    let t = [];
    for (let j = 0; j < state.table[i].courses.length; j++) {
      let courses = [];
      courses.push(state.table[i].courses[j].course_codes_raw);
      if (!state.table[i].courses[j].selected_course) {
        courses.push("WAITING");
      } else {
        courses.push(state.table[i].courses[j].selected_course.course_code);
      }
      t.push(courses);
    }
    course_table.push(t);
  }
  return course_table;
}

const actions = {
  toggleCourseOverride({ commit }, { courseIndex, termIndex }) {
    commit("toggleCourseOverride", { courseIndex, termIndex });
  },
  async export({ state }) {
    let course_table = getCoursesTable(state);
    axios
      .post(backend_api + "/api/requirements/export", {
        table: course_table,
        responseType: "blob"
      })
      .then(response => {
        download(response.data, "uwpath-schedule.csv", "text/csv");
      })
      .catch(function(error) {
        console.error(error);
      });
  },
  fillOutChecklist({ commit, getters, dispatch }) {
    if (!getters.majorRequirements.length) return;
    axios
      .get(backend_api + "/api/requirements/requirements", {
        params: {
          major: getters.majorRequirements[0].info.program_name,
          minors: getters.minorRequirements
            .map(minor => minor.info.program_name)
            .join(),
          option:
            getters.specRequirements.length !== 0
              ? getters.specRequirements[0].info.program_name
              : "",
          calendar_year: getters.calendarYear
        }
      })
      .then(response => {
        //parse table 1 and table 2 data
        let table1needed = false;
        let table2needed = false;
        let newMajorRequirements = response.data.requirements;
        newMajorRequirements.forEach(req => {
          let additionalReqs = req.additional_requirements
            ? req.additional_requirements.toLowerCase().split(", ")
            : [];
          for (let additionalReq of additionalReqs) {
            if (additionalReq === "table ii") table2needed = true;
            if (additionalReq === "table i") table1needed = true;
          }
        });

        let selectedCourses = new TrieSearch(
          [
            ["selected_course", "course_code"],
            ["selected_course", "course_number"]
          ],
          {
            idFieldOrFunction: function getID(req) {
              return req.selected_course.course_id;
            }
          }
        );
        let unselectedCourses = new TrieSearch(["course_codes_raw"], {
          idFieldOrFunction: function getID(req) {
            return req.id;
          }
        });
        for (let term of getters.getTable) {
          for (let course of term.courses) {
            course.satisfiesMajorReq = false;
            course.satisfiesMinorReq = false;
            course.satisfiesSpecializationReq = false;
            if (
              !course.selected_course ||
              course.selected_course.course_code === "WAITING"
            ) {
              unselectedCourses.add(course);
            } else {
              selectedCourses.add(course);
            }
          }
        }

        if (table2needed) {
          newMajorRequirements = newMajorRequirements.concat(
            response.data.table2
          );
        }

        if (response.data.requirements) {
          let parsedMajorRequirements = ParseRequirementsForChecklist(
            newMajorRequirements,
            selectedCourses,
            getters.majorRequirements[0].info,
            unselectedCourses
          );
          if (table1needed) {
            let list1_courses = response.data.table1
              .filter(course => {
                return course.list_number === 1;
              })
              .map(course => {
                return course.course_code;
              })
              .join(",");
            let list2_courses = response.data.table1
              .filter(course => {
                return course.list_number === 2;
              })
              .map(course => {
                return course.course_code;
              })
              .join(",");
            let list1 = {
              course_codes: list1_courses,
              number_of_courses: 1,
              credits_required: 0.5,
              credits_of_prereqs_met: 0,
              consume_course: false
            };
            let list2 = {
              course_codes: list2_courses,
              number_of_courses: 1,
              credits_required: 0.5,
              credits_of_prereqs_met: 0,
              consume_course: false
            };
            let possibleUnselectedMatches = unselectedCourses.get(
              list1_courses
            );
            if (possibleUnselectedMatches.length > 0) {
              list1.credits_of_prereqs_met = 0.5;
              list1.prereqs_met = true;
            } else {
              let list1_courses_split = list1_courses.split(/,|\sor\s/);
              for (let course of list1_courses_split) {
                let possibleMatches = selectedCourses.get(course);
                if (possibleMatches.length > 0) {
                  list1.credits_of_prereqs_met = 0.5;
                  list1.prereqs_met = true;
                  break;
                }
              }
            }

            possibleUnselectedMatches = unselectedCourses.get(list2_courses);
            if (possibleUnselectedMatches.length > 0) {
              list2.credits_of_prereqs_met = 0.5;
              list2.prereqs_met = true;
            } else {
              let list2_courses_split = list2_courses.split(/,|\sor\s/);
              for (let course of list2_courses_split) {
                let possibleMatches = selectedCourses.get(course);
                if (possibleMatches.length > 0) {
                  list2.credits_of_prereqs_met = 0.5;
                  list2.prereqs_met = true;
                  break;
                }
              }
            }
            parsedMajorRequirements.push(new CourseRequirement(list1));
            parsedMajorRequirements.push(new CourseRequirement(list2));
          }
          let majorChecklist = {};
          majorChecklist[
            getters.majorRequirements[0].info.program_name
          ] = parsedMajorRequirements;
          commit("setChecklistMajorRequirements", majorChecklist);
        } else {
          commit("setChecklistMajorRequirements", {});
        }
        if (response.data.minor_requirements) {
          let parsedMinorRequirements = {};
          for (let i = 0; i < getters.minorRequirements.length; i++) {
            parsedMinorRequirements[
              getters.minorRequirements[i].info.program_name
            ] = ParseRequirementsForChecklist(
              response.data.minor_requirements[
                getters.minorRequirements[i].info.program_name
              ],
              selectedCourses,
              getters.minorRequirements[i].info,
              unselectedCourses
            );
          }
          commit("setChecklistMinorRequirements", parsedMinorRequirements);
        } else {
          commit("setChecklistMinorRequirements", {});
        }
        if (response.data.option_requirements) {
          let parsedOptionRequirements = {};
          parsedOptionRequirements[
            getters.specRequirements[0].info.program_name
          ] = ParseRequirementsForChecklist(
            response.data.option_requirements,
            selectedCourses,
            getters.specRequirements[0].info,
            unselectedCourses
          );
          commit("setChecklistOptionRequirements", parsedOptionRequirements);
        } else {
          commit("setChecklistOptionRequirements", {});
        }
        dispatch("updateFirestore");
      })
      .catch(err => {
        // eslint-disable-next-line no-console
        console.error(err);
      });
  },
  updateChecklist({ commit, getters }) {
    if (!getters.majorRequirements.length) return;
    let selectedCourses = new TrieSearch(
      [
        ["selected_course", "course_code"],
        ["selected_course", "course_number"]
      ],
      {
        idFieldOrFunction: function getID(req) {
          return req.selected_course.course_id;
        }
      }
    );
    let unselectedCourses = new TrieSearch(["course_codes_raw"], {
      idFieldOrFunction: function getID(req) {
        return req.id;
      }
    });
    for (let term of getters.getTable) {
      for (let course of term.courses) {
        course.satisfiesMajorReq = false;
        course.satisfiesMinorReq = false;
        course.satisfiesSpecializationReq = false;
        if (
          !course.selected_course ||
          course.selected_course.course_code === "WAITING"
        ) {
          unselectedCourses.add(course);
        } else {
          selectedCourses.add(course);
        }
      }
    }
    if (getters.majorRequirements.length > 0) {
      let parsedMajorRequirements = {};
      parsedMajorRequirements[
        getters.majorRequirements[0].info.program_name
      ] = ParseRequirementsForChecklist(
        getters.checklistMajorRequirements[
          getters.majorRequirements[0].info.program_name
        ],
        selectedCourses,
        getters.majorRequirements[0].info,
        unselectedCourses
      );

      // Handle reqs that don't consume courses (eg English reqs for CS)
      for (let requirement of parsedMajorRequirements[
        getters.majorRequirements[0].info.program_name
      ]) {
        if (!requirement.consume_course) {
          let reqCopy = { ...requirement };
          reqCopy.consume_course = true;
          requirement.prereqs_met = ParseRequirementsForChecklist(
            [reqCopy],
            selectedCourses,
            getters.majorRequirements[0].info,
            unselectedCourses
          )[0].prereqs_met;
        }
      }
      commit("setChecklistMajorRequirements", parsedMajorRequirements);
    } else {
      commit("setChecklistMajorRequirements", {});
    }
    if (getters.minorRequirements.length > 0) {
      let parsedMinorRequirements = {};
      for (let i = 0; i < getters.minorRequirements.length; i++) {
        parsedMinorRequirements[
          getters.minorRequirements[i].info.program_name
        ] = ParseRequirementsForChecklist(
          getters.checklistMinorRequirements[
            getters.minorRequirements[i].info.program_name
          ],
          selectedCourses,
          getters.minorRequirements[i].info,
          unselectedCourses
        );
      }
      commit("setChecklistMinorRequirements", parsedMinorRequirements);
    } else {
      commit("setChecklistMinorRequirements", {});
    }
    if (getters.specRequirements.length > 0) {
      let parsedOptionRequirements = {};
      parsedOptionRequirements[
        getters.specRequirements[0].info.program_name
      ] = ParseRequirementsForChecklist(
        getters.checklistOptionRequirements[
          getters.specRequirements[0].info.program_name
        ],
        selectedCourses,
        getters.specRequirements[0].info,
        unselectedCourses
      );
      commit("setChecklistOptionRequirements", parsedOptionRequirements);
    } else {
      commit("setChecklistOptionRequirements", {});
    }
  }
};

const mutations = {
  toggleCourseOverride: (state, { courseIndex, termIndex }) => {
    state.table[termIndex].courses[courseIndex].overridden = !state.table[
      termIndex
    ].courses[courseIndex].overridden;
  },
  addChecklistRequirement: (
    state,
    { newRequirement, program, programType }
  ) => {
    if (programType === "major") {
      state.checklistMajorRequirements[program].push(newRequirement);
      state.checklistMajorRequirements[program] = sortRequirementsByYear(
        state.checklistMajorRequirements[program]
      );
    } else if (programType === "minor") {
      state.checklistMinorRequirements[program].push(newRequirement);
      state.checklistMinorRequirements[program] = sortRequirementsByYear(
        state.checklistMinorRequirements[program]
      );
    } else if (programType === "option") {
      state.checklistOptionRequirements[program].push(newRequirement);
      state.checklistOptionRequirements[program] = sortRequirementsByYear(
        state.checklistOptionRequirements[program]
      );
    }
  },
  removeSingleRequirement: (state, { program, requirement, programType }) => {
    if (programType === "major") {
      state.checklistMajorRequirements[
        program
      ] = state.checklistMajorRequirements[program].filter(req => {
        return req.id !== requirement.id;
      });
    } else if (programType === "minor") {
      state.checklistMinorRequirements[
        program
      ] = state.checklistMinorRequirements[program].filter(req => {
        return req.id !== requirement.id;
      });
    } else if (programType === "option") {
      state.checklistOptionRequirements[
        program
      ] = state.checklistOptionRequirements[program].filter(req => {
        return req.id === requirement.id;
      });
    }
  },
  updateSingleRequirement: (state, { program, requirement, programType }) => {
    if (programType === "major") {
      for (
        let i = 0;
        i < state.checklistMajorRequirements[program].length;
        i++
      ) {
        if (
          state.checklistMajorRequirements[program][i].id === requirement.id
        ) {
          state.checklistMajorRequirements[program][i] = requirement;
          break;
        }
      }
    } else if (programType === "minor") {
      for (
        let i = 0;
        i < state.checklistMinorRequirements[program].length;
        i++
      ) {
        if (
          state.checklistMinorRequirements[program][i].id === requirement.id
        ) {
          state.checklistMinorRequirements[program][i] = requirement;
          break;
        }
      }
    } else if (programType === "option") {
      for (
        let i = 0;
        i < state.checklistOptionRequirements[program].length;
        i++
      ) {
        if (
          state.checklistOptionRequirements[program][i].id === requirement.id
        ) {
          state.checklistOptionRequirements[program][i] = requirement;
          break;
        }
      }
    }
  },
  updateCacheTime: state => {
    state.cacheTime = new Date();
  },
  setChecklistMajorRequirements: (state, checklistMajorRequirements) => {
    state.checklistMajorRequirements = checklistMajorRequirements;
  },
  setChecklistMinorRequirements: (state, checklistMinorRequirements) => {
    state.checklistMinorRequirements = checklistMinorRequirements;
  },
  setChecklistOptionRequirements: (state, checklistOptionRequirements) => {
    state.checklistOptionRequirements = checklistOptionRequirements;
  },
  addTermToTable: state => {
    let newTerm = {
      courses: []
    };
    state.table.push(newTerm);
  },
  deleteTermFromTable: (state, deletedTerm) => {
    if (!deletedTerm.courses.length) {
      state.table.splice(state.table.indexOf(deletedTerm), 1);
    }
  },
  removeRequirementFromTable: (state, deletedReq) => {
    for (let term of state.table) {
      let index = term.courses.indexOf(deletedReq);
      if (index !== -1) {
        term.courses.splice(index, 1);
        return;
      }
    }
  },
  addCourse: (state, { newRequirement, termIndex }) => {
    state.table[termIndex].courses.push(newRequirement);
  },
  validateCourses: state => {
    let listOfCoursesTaken = [];
    for (let i = 0; i < state.table.length; i++) {
      let currentTermCourses = state.table[i].courses
        .filter(course => {
          return (
            course.selected_course.course_code !== "WAITING" &&
            !course.clickedDelete
          );
        })
        .map(course => {
          return course.selected_course.course_code;
        });
      for (let requirement of state.table[i].courses) {
        // If course has no prereq, then course can be taken
        if (
          requirement.selected_course.course_code !== "WAITING" &&
          requirement.selected_course.prereqs.length === 0
        ) {
          requirement.prereqs_met = true;
        }
        //there if course has not been selected yet then dont do anything
        else if (!requirement.selected_course) continue;
        else if (requirement.isSelected()) {
          if (requirement.selected_course.prereqs.length === 0) {
            requirement.prereqs_met = true;
          } else {
            // if an error has appeared previously we don't call the backend again
            // We also don't call backend if the course has been overriden

            if (!requirement.isBackendError && !requirement.overridden) {
              axios
                .get(backend_api + "/api/meets_prereqs/get", {
                  params: {
                    list_of_courses_taken: listOfCoursesTaken,
                    current_term_courses: currentTermCourses,
                    pk: requirement.selected_course.course_code
                  }
                })
                .then(response => {
                  requirement.prereqs_met = response.data.can_take;
                  if (!requirement.prereqs_met) {
                    requirement.validation_message = response.data.msg;
                  }
                })
                .catch(err => {
                  // eslint-disable-next-line no-console
                  // we set a flag so we don't get 1000 emails in the backend
                  // every time a new course is dragged and this course has prob in
                  // the backend
                  requirement.isBackendError = true;
                  console.error(err);
                });
            }
          }
        }
      }
      listOfCoursesTaken = listOfCoursesTaken.concat(currentTermCourses);
    }
  },
  clearMinorFromTable: (state, minors) => {
    for (let term of state.table) {
      for (let course of term.courses) {
        course.minor = course.minor.filter(c => {
          return !minors.includes(c.program_name);
        });
      }
      /*term.courses = term.courses.filter(req => {
                return req.minor.length;
            })*/
    }
  },
  clearOptionTable: state => {
    for (let term of state.table) {
      term.courses = term.courses.filter(req => {
        return req.specialization.length === 0;
      });
    }
  },
  clearTable: state => {
    state.table = JSON.parse(JSON.stringify(defaultTable));
  },
  loadCourseSelectionFromFirestore: (state, firestoreCourseSelectionModule) => {
    state.table = firestoreCourseSelectionModule.table.map(term => {
      return {
        courses: term.courses.map(req => {
          req.id = uuidv4();
          return new CourseRequirement(req);
        })
      };
    });
    for (const [programName, requirements] of Object.entries(
      firestoreCourseSelectionModule.checklistMajorRequirements
    )) {
      firestoreCourseSelectionModule.checklistMajorRequirements[
        programName
      ] = requirements.map(req => {
        req.id = uuidv4();
        return new CourseRequirement(req);
      });
    }
    for (const [programName, requirements] of Object.entries(
      firestoreCourseSelectionModule.checklistMinorRequirements
    )) {
      firestoreCourseSelectionModule.checklistMinorRequirements[
        programName
      ] = requirements.map(req => {
        req.id = uuidv4();
        return new CourseRequirement(req);
      });
    }
    for (const [programName, requirements] of Object.entries(
      firestoreCourseSelectionModule.checklistOptionRequirements
    )) {
      firestoreCourseSelectionModule.checklistOptionRequirements[
        programName
      ] = requirements.map(req => {
        req.id = uuidv4();
        return new CourseRequirement(req);
      });
    }
    state.checklistMajorRequirements =
      firestoreCourseSelectionModule.checklistMajorRequirements;
    state.checklistMinorRequirements =
      firestoreCourseSelectionModule.checklistMinorRequirements;
    state.checklistOptionRequirements =
      firestoreCourseSelectionModule.checklistOptionRequirements;
  }
};

export default {
  state,
  getters,
  actions,
  mutations,
  defaultTable
};
