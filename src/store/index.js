import Vuex from "vuex";
import Vue from "vue";

import createPersistedState from "vuex-persistedstate";

import courses from "./modules/courses";
import programInfo from "./modules/programInfo";
import courseSelection from "./modules/courseSelection";
import email from "./modules/email";
import user from "./modules/user";

import { CourseRequirement } from "../models/courseRequirementModel";
import { MajorRequirement, OtherRequirement } from "../models/ProgramModel";

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    courses,
    courseSelection,
    programInfo,
    email,
    user
  },
  plugins: [
    createPersistedState({
      paths: [
        "courseSelection.table",
        "courseSelection.cacheTime",
        "courses.majorRequirements",
        "courses.minorRequirements",
        "courses.specRequirements",
        "courses.calendarYear",
        "programInfo",
        "courseSelection.checklistMajorRequirements",
        "courseSelection.checklistMinorRequirements",
        "courseSelection.checklistOptionRequirements"
      ],
      getState: key => {
        const value = window.localStorage.getItem(key);

        try {
          if (typeof value !== "undefined") {
            let obj = JSON.parse(value);
            let today = new Date();
            obj["courseSelection"]["cacheTime"] = new Date(
              obj["courseSelection"]["cacheTime"]
            );
            if (
              !(
                obj["courseSelection"]["cacheTime"] instanceof Date &&
                !isNaN(obj["courseSelection"]["cacheTime"])
              )
            ) {
              obj["courseSelection"]["cacheTime"] = today;
            }

            let hours =
              Math.abs(today - obj["courseSelection"]["cacheTime"]) / 36e5;
            obj["courseSelection"]["cacheTime"] = today;

            hours = 0; // Makes cache infinite, but leaves code in place if we do want a timeout for caching later on
            if (hours <= 24) {
              for (var i in obj["courseSelection"]["table"]) {
                for (var j in obj["courseSelection"]["table"][i]["courses"]) {
                  let loadedCourseRequirement = new CourseRequirement(
                    obj["courseSelection"]["table"][i]["courses"][j]
                  );
                  loadedCourseRequirement.inRequirementBar = false;
                  obj["courseSelection"]["table"][i]["courses"][
                    j
                  ] = loadedCourseRequirement;
                }
              }
              for (i in obj["courses"]["majorRequirements"]) {
                obj["courses"]["majorRequirements"][i] = new MajorRequirement(
                  obj["courses"]["majorRequirements"][i]
                );
              }

              for (i in obj["courses"]["minorRequirements"]) {
                obj["courses"]["minorRequirements"][i] = new OtherRequirement(
                  obj["courses"]["minorRequirements"][i]
                );
              }

              for (i in obj["courses"]["specRequirements"]) {
                obj["courses"]["specRequirements"][i] = new OtherRequirement(
                  obj["courses"]["specRequirements"][i]
                );
              }

              // Persist Checklist Data
              for (i in obj["courseSelection"]["checklistMajorRequirements"]) {
                obj["courseSelection"]["checklistMajorRequirements"][i] = obj[
                  "courseSelection"
                ]["checklistMajorRequirements"][i].map(
                  req => new CourseRequirement(req)
                );
              }
              for (i in obj["courseSelection"]["checklistMinorRequirements"]) {
                obj["courseSelection"]["checklistMinorRequirements"][i] = obj[
                  "courseSelection"
                ]["checklistMinorRequirements"][i].map(
                  req => new CourseRequirement(req)
                );
              }
              for (i in obj["courseSelection"]["checklistOptionRequirements"]) {
                obj["courseSelection"]["checklistOptionRequirements"][i] = obj[
                  "courseSelection"
                ]["checklistOptionRequirements"][i].map(
                  req => new CourseRequirement(req)
                );
              }

              obj["courseSelection"]["cacheTime"] = new Date(
                obj["courseSelection"]["cacheTime"]
              );
            } else {
              obj["courseSelection"]["cacheTime"] = today;
              obj["courseSelection"]["table"] = JSON.parse(
                JSON.stringify(courseSelection.defaultTable)
              );
              obj["courseSelection"]["checklistMajorRequirements"] = {};
              obj["courseSelection"]["checklistMinorRequirements"] = {};
              obj["courseSelection"]["checklistOptionRequirements"] = {};

              obj["courses"]["majorRequirements"] = [];
              obj["courses"]["minorRequirements"] = [];
              obj["courses"]["specRequirements"] = [];
              obj["courses"]["calendarYear"] = "";

              obj["programInfo"]["majors"] = [];
              obj["programInfo"]["minors"] = [];
              obj["programInfo"]["specialization"] = [];
            }
            return obj;
          }
        } catch (err) {
          console.error(err);
        }

        return undefined;
      },
      setState: (key, state) => {
        return window.localStorage.setItem(key, JSON.stringify(state));
      }
    })
  ]
});
