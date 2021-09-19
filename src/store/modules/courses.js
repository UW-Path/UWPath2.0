import axios from "axios";
import {
  CourseRequirement,
  YEAR_TO_REQ_SECTION_MAP
} from "../../models/courseRequirementModel";
import { MajorRequirement, OtherRequirement } from "../../models/ProgramModel";
import { backend_api } from "../../backendAPI";
const state = {
  majorRequirements: [],
  minorRequirements: [],
  specRequirements: [],
  // This maps the course_codes_raw of a req to the course information of courses which satisfy the req
  courseSatisfactionCache: {},
  calendarYear: ""
};

const getters = {
  majorRequirements: state => state.majorRequirements,
  minorRequirements: state => state.minorRequirements,
  specRequirements: state => state.specRequirements,
  courseSatisfactionCache: state => state.courseSatisfactionCache,
  calendarYear: state => state.calendarYear
};

const actions = {
  // Fetching requirements simply adds requirements to the requirement column.
  // To delete the requirements, one would need to call the functions in mutations section
  async fetchRequirements({ commit, getters, state }, options) {
    if (!options.newMajor && !getters.majorRequirements.length) return;

    // based on Major since we only refer to ONE calender year
    let year = "";
    if (options.newMajor) {
      year = options.newMajorYear;
    } else if (getters.calendarYear) {
      year = getters.calendarYear;
    } else {
      // this case sholdn't happen, unless it is old cache
      year = "2020-2021"; //set as default for now
    }

    state.calendarYear = year;

    const response = await axios.get(
      backend_api + "/api/requirements/requirements",
      {
        params: {
          major: options.newMajor
            ? options.newMajor.program_name
            : getters.majorRequirements[0].info.program_name,
          minors: options.newMinor
            ? options.newMinor
            : getters.minorRequirements
                .map(minor => minor.info.program_name)
                .join(),
          option: options.newSpecialization
            ? options.newSpecialization.program_name
            : "",
          calendar_year: year
        }
      }
    );

    let newMajorRequirements = response.data.requirements;
    if (options.newMajor) {
      let newMajor = new MajorRequirement({ info: options.newMajor });
      let table1needed = false;
      let table2needed = false;

      //find all the additional requirements first
      response.data.requirements.forEach(req => {
        let additionalReqs = req.additional_requirements
          ? req.additional_requirements.toLowerCase().split(", ")
          : [];
        for (let additionalReq of additionalReqs) {
          if (additionalReq === "table ii") table2needed = true;
          if (additionalReq === "table i") table1needed = true;
        }
      });

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
          group: "English I"
        };
        let list2 = {
          course_codes: list2_courses,
          number_of_courses: 1,
          group: "English II"
        };
        newMajorRequirements.push(list1);
        newMajorRequirements.push(list2);
      }

      if (table2needed) {
        newMajorRequirements = newMajorRequirements.concat(
          response.data.table2
        );
      }

      for (let requirement of newMajorRequirements) {
        const code = requirement.course_codes;
        let group = "";
        if (
          code === "SCIENCE" ||
          code === "MATH" ||
          code === "LANGUAGE" ||
          code === "NON-MATH" ||
          (code !== "Program Elective" && code.includes("Elective"))
        )
          group = code;
        // check for english I/II
        if (requirement.group) group = requirement.group;

        let parsed_requirement = {
          course_codes_raw: requirement.course_codes,
          number_of_courses: requirement.number_of_courses,
          major: [options.newMajor],
          additional_requirements: requirement.additional_requirements,
          inRequirementBar: true,
          group: group
        };
        let parsed_req_obj = new CourseRequirement(parsed_requirement);
        newMajor[YEAR_TO_REQ_SECTION_MAP[parsed_req_obj.year]].push(
          parsed_req_obj
        );
      }
      state.majorRequirements.push(newMajor);

      let compiledReqs = [];
      Object.values(newMajor.sections()).forEach(section => {
        compiledReqs = compiledReqs.concat(section);
      });

      commit("setMinor", response.data["minor_list"]);
      commit("setSpecialization", response.data["option_list"]);
    }
    // Minor requirements
    if (
      response.data.minor_requirements !== undefined &&
      options.newMinor &&
      options.newMinor.length
    ) {
      for (let minor in response.data.minor_requirements) {
        let newMinor = new OtherRequirement({
          info: getters.findMinorByProgram(minor)
        });
        for (let requirement of response.data.minor_requirements[minor]) {
          let parsed_requirement = {
            course_codes_raw: requirement.course_codes,
            number_of_courses: requirement.number_of_courses,
            minor: [getters.findMinorByProgram(minor)],
            additional_requirements: requirement.additional_requirements,
            inRequirementBar: true
          };
          let parsed_req_obj = new CourseRequirement(parsed_requirement);
          newMinor[YEAR_TO_REQ_SECTION_MAP[parsed_req_obj.year]].push(
            parsed_req_obj
          );
        }
        state.minorRequirements.push(newMinor);
      }
    }
    // Option requirements
    if (
      response.data.option_requirements !== undefined &&
      options.newSpecialization
    ) {
      let newSpec = new OtherRequirement({ info: options.newSpecialization });

      for (let requirement of response.data.option_requirements) {
        let parsed_requirement = {
          course_codes_raw: requirement.course_codes,
          number_of_courses: requirement.number_of_courses,
          specialization: [options.newSpecialization],
          additional_requirements: requirement.additional_requirements,
          inRequirementBar: true
        };
        let parsed_req_obj = new CourseRequirement(parsed_requirement);
        newSpec[YEAR_TO_REQ_SECTION_MAP[parsed_req_obj.year]].push(
          parsed_req_obj
        );
      }
      state.specRequirements.push(newSpec);
    }
  }
};

const mutations = {
  setCacheItem: (state, { course_codes_raw, satisfyingCourses }) => {
    state.courseSatisfactionCache[course_codes_raw] = satisfyingCourses;
  },
  addCourseRequirement: (state, requirement) => {
    if (requirement.major.length) {
      let major = state.majorRequirements.find(req => {
        return req.info.program_name === requirement.major[0].program_name;
      });
      major[YEAR_TO_REQ_SECTION_MAP[requirement.year]].push(requirement);
    } else if (requirement.minor.length) {
      let minor = state.minorRequirements.find(req => {
        return req.info.program_name === requirement.minor[0].program_name;
      });
      minor[YEAR_TO_REQ_SECTION_MAP[requirement.year]].push(requirement);
    } else if (requirement.specialization.length) {
      let spec = state.specRequirements.find(req => {
        return (
          req.info.program_name === requirement.specialization[0].program_name
        );
      });
      spec[YEAR_TO_REQ_SECTION_MAP[requirement.year]].push(requirement);
    }
  },
  addMajor: (state, majorRequirement) => {
    state.majorRequirements.push(majorRequirement);
  },
  addMinor: (state, minorRequirement) => {
    state.minorRequirements.push(minorRequirement);
  },
  addSpec: (state, specRequirement) => {
    state.specRequirements.push(specRequirement);
  },
  removeMajor: state => {
    state.majorRequirements = [];
  },
  removeMinor: (state, minors) => {
    state.minorRequirements = state.minorRequirements.filter(req => {
      return (
        !minors.length ||
        (minors[0] !== "ALL" && !minors.includes(req.info.program_name))
      );
    });
  },
  removeOption: state => {
    state.specRequirements = [];
  },
  separateRequirement: (state, requirement) => {
    let program = undefined;
    //courses are only separated if there isn't 1
    if (requirement.number_of_courses === 1) return;
    if (requirement.major.length !== 0) program = state.majorRequirements[0];
    if (requirement.minor.length !== 0) program = state.minorRequirements[0];
    if (requirement.specialization.length !== 0)
      program = state.specRequirements[0];
    let selected_section = program[YEAR_TO_REQ_SECTION_MAP[requirement.year]];
    selected_section.push(requirement.split());
  },
  // sorts and splices all of the requirements
  sortRequirements: state => {
    let collapseAndSort = group => {
      group.sort((a, b) => {
        if (a.isSelected() && !b.isSelected()) return 1;
        if (!a.isSelected() && b.isSelected()) return -1;
        return 0;
      });
    };
    for (let major of state.majorRequirements) {
      for (let section of Object.values(major.sections()))
        collapseAndSort(section);
    }
    for (let minor of state.minorRequirements) {
      for (let section of Object.values(minor.sections()))
        collapseAndSort(section);
    }
    for (let spec of state.specRequirements) {
      for (let section of Object.values(spec.sections()))
        collapseAndSort(section);
    }
  },
  decrementRequirementID: (state, id) => {
    let checkArrayForID = sec => {
      for (let req of sec) {
        if (req.id === id && req.number_of_courses > 1 && !req.isSelected()) {
          req.number_of_courses--;
          return true;
        }
      }
      return false;
    };
    for (let major of state.majorRequirements) {
      for (let section of Object.values(major.sections()))
        if (checkArrayForID(section)) return;
    }
    for (let minor of state.minorRequirements) {
      for (let section of Object.values(minor.sections()))
        if (checkArrayForID(section)) return;
    }
    for (let spec of state.specRequirements) {
      for (let section of Object.values(spec.sections()))
        if (checkArrayForID(section)) return;
    }
  },
  loadCoursesFromFireStore: (state, fireStoreCoursesModule) => {
    state.majorRequirements = fireStoreCoursesModule.majorRequirements.map(
      req => new MajorRequirement(req)
    );
    state.minorRequirements = fireStoreCoursesModule.minorRequirements.map(
      req => new OtherRequirement(req)
    );
    state.specRequirements = fireStoreCoursesModule.specRequirements.map(
      req => new OtherRequirement(req)
    );
  }
};

export default {
  state,
  getters,
  actions,
  mutations
};
