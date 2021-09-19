<template>
  <div>
    <!-- Required Course Block -->
    <CourseCard
      class="list-group-item card"
      :key="courseIndex"
      :termIndex="termIndex"
      :courseIndex="courseIndex"
      :courseData="course"
      :onSelectionBar="onSelectionBar"
      @click.native="enableDialog()"
    />
    <!-- Course Popup Modal -->
    <v-dialog v-model="dialog" :max-width="isChoice() ? 1200 : 700">
      <v-card v-if="selectedCourse" class="modal">
        <v-container fluid class="modal-course-list-container">
          <v-row class="modal-course-list-row">
            <v-col align="center" v-if="isChoice()">
              <v-text-field
                class="modal-search"
                v-model="searchtext"
                label="Search for a Course"
                prepend-inner-icon="mdi-magnify"
                hide-details="true"
                single-line
                outlined
                dense
              ></v-text-field>
              <div v-if="allCourseChoices.length > 0" class="modal-course-list">
                <div
                  class="modal-course"
                  v-bind:class="{
                    selectedCourseCode:
                      course &&
                      selectedCourse &&
                      selectedCourse.course_code === course.course_code
                  }"
                  v-for="(course, index) in filteredCourses"
                  :key="index"
                >
                  <v-icon
                    class="quick-add-icon"
                    @click="quickSelectCourse(course)"
                    >mdi-plus</v-icon
                  >
                  <div
                    class="modal-course-list-display"
                    v-on:click="selectedCourse = course"
                  >
                    {{
                      course.course_name !== ""
                        ? course.course_code + ": " + course.course_name
                        : course.course_code
                    }}
                  </div>
                </div>
              </div>
              <v-card v-else class="loading-card">
                <v-progress-circular
                  size="75"
                  indeterminate
                  color="primary"
                ></v-progress-circular>
              </v-card>
            </v-col>
            <v-col class="course-description-col" align="left">
              <v-card-title class="course-title">
                {{ selectedCourse.course_code }}
                <v-spacer></v-spacer>
                <template
                  v-if="
                    !this.course.prereqs_met && !this.course.inRequirementBar
                  "
                >
                  <v-btn
                    class="select-btn"
                    text
                    @click="toggleOverride(courseIndex, termIndex)"
                    v-if="!this.course.overridden"
                    large
                    outlined
                  >
                    Override
                  </v-btn>
                  <v-btn
                    class="select-btn"
                    text
                    @click="toggleOverride(courseIndex, termIndex)"
                    v-else-if="this.course.overridden"
                    large
                    outlined
                  >
                    de-Override
                  </v-btn>
                </template>
                <template v-if="isChoice()">
                  <v-btn
                    class="select-btn"
                    text
                    @click="selectCourse()"
                    v-if="selectedCourse != this.course.selected_course"
                    large
                    outlined
                  >
                    Select
                    <v-icon>mdi-plus-circle</v-icon>
                  </v-btn>
                  <v-btn
                    class="select-btn"
                    text
                    @click="deselectCourse()"
                    v-else
                    large
                    outlined
                  >
                    Deselect
                    <v-icon>mdi-minus-circle</v-icon>
                  </v-btn>
                </template>
              </v-card-title>
              <v-card-subtitle class="course-name">
                {{ selectedCourse.course_name }}
              </v-card-subtitle>
              <template v-if="selectedCourse.course_id != -1">
                <v-card-subtitle class="course-info-subheading">
                  Credits: {{ selectedCourse.credit }} | ID:
                  {{ selectedCourse.course_id }} |
                  <a
                    style="text-decoration:none"
                    target="_blank"
                    :href="
                      'https://uwflow.com/course/' +
                        selectedCourse.course_code
                          .replace(/\s/g, '')
                          .toLowerCase()
                    "
                    >UWFlow link</a
                  >
                </v-card-subtitle>
              </template>
              <v-card-text>{{
                selectedCourse.info +
                  (selectedCourse.offering.length === 0
                    ? ""
                    : " Offered in: " + selectedCourse.offering + ". ") +
                  (selectedCourse.online ? "Also offered online." : "")
              }}</v-card-text>
              <template v-if="selectedCourse.course_id != -1">
                <v-card-text class="course-description-text">{{
                  "Credits: " + selectedCourse.credit
                }}</v-card-text>
                <v-card-text
                  class="course-description-text"
                  v-if="
                    selectedCourse.prereqs && selectedCourse.prereqs.length > 0
                  "
                  >{{ "Prerequisites: " + selectedCourse.prereqs }}</v-card-text
                >
                <v-card-text
                  class="course-description-text"
                  v-if="
                    selectedCourse.antireqs &&
                      selectedCourse.antireqs.length > 0
                  "
                  >{{
                    "Antirequisites: " + selectedCourse.antireqs
                  }}</v-card-text
                >
                <v-card-text
                  class="course-description-text"
                  v-if="
                    selectedCourse.coreqs && selectedCourse.coreqs.length > 0
                  "
                  >{{ "Corequisites: " + selectedCourse.coreqs }}</v-card-text
                >
              </template>
            </v-col>
          </v-row>
        </v-container>
      </v-card>
      <v-card v-else class="loading-card">
        <v-progress-circular
          size="75"
          indeterminate
          color="primary"
        ></v-progress-circular>
      </v-card>
    </v-dialog>
  </div>
</template>
<script>
import { mapMutations, mapActions, mapGetters } from "vuex";
import CourseCard from "../Cards/CourseCard";
import axios from "axios";
import { CourseInfo } from "../../models/courseInfoModel";
import TrieSearch from "trie-search";
import { backend_api } from "../../backendAPI";
import _ from "lodash";

export default {
  name: "RequirementOptionsModal",
  components: {
    CourseCard
  },
  data() {
    return {
      dialog: false,
      searchtext: "",
      selectedCourse:
        this.course.selected_course &&
        this.course.selected_course.course_code !== "WAITING"
          ? this.course.selected_course
          : undefined,
      allCourseChoices: [],
      allCourseChoicesTrie: new TrieSearch(["course_code", "course_number"], {
        idFieldOrFunction: function(course) {
          return course.course_id + course.course_code;
        }
      })
    };
  },
  props: {
    course: Object,
    termIndex: Number,
    courseIndex: Number,
    onSelectionBar: Boolean
  },
  created() {
    // Set a temporary number_of_choices while we wait for the course choices to get loaded.
    if (
      this.course.number_of_courses > 1 ||
      !this.course.course_codes_raw.match(/\d/)
    ) {
      this.course.number_of_choices = 4;
    }
    if (this.courseSatisfactionCache[this.course.course_codes_raw]) {
      this.allCourseChoices = this.courseSatisfactionCache[
        this.course.course_codes_raw
      ];
      _.defer(this.updateAllCourseChoicesTrie);
    } else {
      let promises = [];
      let required_courses = this.course.course_codes_raw.split(/,\s|\sor\s|,/);
      // Get all possible course choices for the requirement
      for (let course of required_courses) {
        promises.push(this.parseRequirement(course));
      }
      Promise.all(promises)
        .then(choices => {
          for (let choice of choices) {
            this.allCourseChoices = this.allCourseChoices.concat(choice);
          }
          _.defer(this.updateAllCourseChoicesTrie);
          this.setCacheItem({
            course_codes_raw: this.course.course_codes_raw,
            satisfyingCourses: this.allCourseChoices
          });
        })
        .catch(error => {
          console.error(error);
        });
    }
  },
  methods: {
    ...mapMutations([
      "validateCourses",
      "separateRequirement",
      "removeRequirementFromTable",
      "addCourseRequirement",
      "sortRequirements",
      "updateCacheTime",
      "setCacheItem"
    ]),
    ...mapActions([
      "updateChecklist",
      "toggleCourseOverride",
      "updateFirestore"
    ]),
    async updateAllCourseChoicesTrie() {
      // Handle cases like "BUS 300-" where only a single course code is used but many choices exist
      if (
        this.allCourseChoices.length === 1 &&
        this.allCourseChoices[0].course_code.includes("-")
      ) {
        this.course.number_of_choices = 4;
      } else {
        this.course.number_of_choices = this.allCourseChoices.length;
      }
      // Set a selected course if none exists
      if (
        this.allCourseChoices.length === 1 &&
        (!this.course.selected_course ||
          this.course.selected_course.course_code === "WAITING")
      ) {
        this.course.selected_course = this.allCourseChoices[0];
      }
      this.selectedCourse = this.selectedCourse || this.allCourseChoices[0];
      // Update course Trie
      this.allCourseChoicesTrie.addAll(this.allCourseChoices);
    },
    toggleOverride(courseIndex, termIndex) {
      this.toggleCourseOverride({ courseIndex, termIndex });
    },
    enableDialog() {
      if (!this.course.clickedDelete) {
        this.selectedCourse =
          this.course.selected_course &&
          this.course.selected_course.course_code !== "WAITING"
            ? this.course.selected_course
            : this.allCourseChoices[0];
        this.dialog = true;
      } else {
        if (!this.onSelectionBar) {
          this.course.inRequirementBar = true;
          this.course.overridden = false;
          this.removeRequirementFromTable(this.course);
          if (
            this.course.major.length ||
            this.course.minor.length ||
            this.course.specialization.length
          ) {
            this.addCourseRequirement(this.course);
          }
          this.validateCourses();
          this.updateChecklist();
          this.sortRequirements();
          this.updateFirestore();
        } else {
          this.course.hidden = true;
        }
        this.course.clickedDelete = false;
      }
    },
    selectCourse: function() {
      this.updateCacheTime();
      this.course.selected_course = this.selectedCourse;
      this.separateRequirement(this.course);
      this.validateCourses();
      this.updateChecklist();
      this.updateFirestore();
      this.dialog = false;
    },
    quickSelectCourse: function(course) {
      this.selectedCourse = course;
      this.updateCacheTime();
      this.course.selected_course = course;
      this.separateRequirement(this.course);
      this.validateCourses();
      this.updateChecklist();
      this.updateFirestore();
      this.dialog = false;
    },
    deselectCourse() {
      this.updateCacheTime();
      this.course.deselect();
      this.validateCourses();
      this.updateChecklist();
      this.updateFirestore();
      this.dialog = false;
    },
    isSelected: function(courseCode) {
      if (!this.course.selected_course) return false;
      return courseCode === this.course.selected_course.course_code;
    },
    isChoice: function() {
      return this.course.number_of_choices > 1;
    },
    close: function() {
      let ok = "";
      void ok;
    },
    open: function() {
      let ok = "";
      void ok;
    },
    // Fetch course information of a single course code or a course pattern (eg MATH 239 or PHYS 300-)
    // requirement is the courseRequirement object that this course code belongs to
    async parseRequirement(courseCode) {
      let hasNumber = /\d/;
      let response = null;
      let parsedCourseInfos = [];
      // 1. SPECIFIC CASES THAT DOES NOT PERTAIN TO A COURSE PATTERN
      // Engineering specific/Program Elective
      if (courseCode.includes("TE")) {
        parsedCourseInfos = [
          {
            course_name: "Technical Elective",
            course_code: courseCode,
            info:
              "Please refer to degree requirement page for more information. (Click on program heading)",
            credit: 0.5
          }
        ];
      } else if (courseCode.includes("CSE")) {
        parsedCourseInfos = [
          {
            course_name: "Complementary Studies Elective",
            course_code: courseCode,
            info:
              "Please refer to degree requirement page for more information. (Click on program heading)",
            credit: 0.5
          }
        ];
      } else if (courseCode.includes("Program Elective")) {
        parsedCourseInfos = [
          {
            course_name: courseCode,
            course_code: courseCode.replace("Program Elective", "PE"),
            info:
              "Please refer to degree requirement page for more information. (Click on program heading)",
            credit: 0.5
          }
        ];
      } else if (courseCode.includes("WKRPT")) {
        // Work Term Report
        parsedCourseInfos = [
          {
            course_code: courseCode,
            course_name: "Work-term Report",
            info:
              "Work-term Report. Please refer to degree requirement page for more information. (Click on program heading)",
            credit: 0.5,
            online: false
          }
        ];
      }
      // TODO: this should be a card if there exists more courses that are more than 1
      else if (
        courseCode === "SCIENCE" ||
        courseCode === "MATH" ||
        courseCode === "LANGUAGE" ||
        courseCode === "NON-MATH"
      ) {
        response = await axios
          .get(backend_api + "/api/course-info/filter", {
            params: {
              start: 0,
              end: 499,
              code: courseCode
            }
          })
          .catch(error => {
            void error;
            return null;
          });
        parsedCourseInfos = response.data;
      } else if (courseCode.includes("Elective")) {
        response = await axios
          .get(backend_api + "/api/course-info/filter", {
            params: {
              start: 0,
              end: 1000,
              code: "none"
            }
          })
          .catch(error => {
            void error;
            return null;
          });
        parsedCourseInfos = response.data;
      }
      // 2. QUERYABLE CASES
      else if (!hasNumber.test(courseCode)) {
        // Handles non numerical courses such as MATH, ACTSC
        response = await axios
          .get(backend_api + "/api/course-info/filter", {
            params: {
              start: 0,
              end: 499,
              code: courseCode
            }
          })
          .catch(error => {
            void error;
            return null;
          });
        parsedCourseInfos = response.data;
      } else if (courseCode[courseCode.length - 1] === "-") {
        // Handles X00's case, eg PHYS 300-
        let split = courseCode.split(" ");
        if (split[1] === "LAB") {
          response = await axios
            .get(backend_api + "/api/course-info/filter", {
              params: {
                start: Number(split[2].slice(0, -1)),
                end: Number(split[2].slice(0, -1)) + 99,
                code: split[0] + " " + split[1]
              }
            })
            .catch(error => {
              console.error(error);
            });
          parsedCourseInfos = response.data;
        } else if (split[0] === "BUS") {
          // Laurier course
          parsedCourseInfos = [
            {
              course_code: courseCode,
              info:
                "Information about these courses is unavailable. Please refer to https://loris.wlu.ca/register/ssb/registration for more details.",
              online: false,
              credit: 0.5
            }
          ];
        } else {
          response = await axios
            .get(backend_api + "/api/course-info/filter", {
              params: {
                start: Number(split[1].slice(0, -1)),
                end: Number(split[1].slice(0, -1)) + 99,
                code: split[0]
              }
            })
            .catch(error => {
              console.error(error);
            });
          parsedCourseInfos = response.data;
        }
      } else if (
        courseCode.split("-").length === 2 &&
        courseCode.split("-")[0].length > 0 &&
        courseCode.split("-")[1].length > 0
      ) {
        // Handles range case, eg CS 440-CS 498
        let split = courseCode.split("-");
        response = await axios
          .get(backend_api + "/api/course-info/filter", {
            params: {
              start: Number(split[0].split(" ")[1]),
              end: Number(split[1].split(" ")[1]),
              code: split[0].split(" ")[0]
            }
          })
          .catch(error => {
            console.error(error);
          });
        parsedCourseInfos = response.data;
      } else if (courseCode.includes("W")) {
        // Laurier course
        parsedCourseInfos = [
          {
            course_code: courseCode,
            info:
              "Information about this course is unavailable. Please refer to https://loris.wlu.ca/register/ssb/registration for more details.",
            online: false,
            credit: 0.5
          }
        ];
      } else if (courseCode.split(" ").length >= 1) {
        // Handles normal course case, ege MATH 239
        response = await axios
          .get(backend_api + "/api/course-info/get", {
            params: {
              pk: courseCode
            }
          })
          .catch(error => {
            console.error(error);
          });
        parsedCourseInfos = [response.data];
      } else {
        parsedCourseInfos = [
          {
            course_code: courseCode,
            info: "Information about this course is unavailable.",
            online: false,
            credit: 0.5
          }
        ];
      }

      return parsedCourseInfos.map(courseInfo => {
        return new CourseInfo(courseInfo);
      });
    }
  },
  computed: {
    ...mapGetters(["courseSatisfactionCache"]),
    filteredCourses: function() {
      if (this.searchtext === "") return this.allCourseChoices.slice(0, 50);
      else {
        var digitSplit = this.searchtext
          .replace(/\s/g, "")
          .match(/[\d.]+|\D+/g);
        var filterArray = [];
        if (digitSplit.length > 1) {
          filterArray = [digitSplit[0], digitSplit.splice(1).join("")];
        } else {
          filterArray = digitSplit;
        }
        return this.allCourseChoicesTrie
          .get(filterArray, TrieSearch.UNION_REDUCER)
          .slice(0, 50);
      }
    },
    courseCodes: function() {
      return this.allCourseChoices.map(choice => {
        return choice.course_code;
      });
    },
    hasSelected: function() {
      return this.course.selected_course !== undefined;
    }
  }
};
</script>
<style scoped>
.course-list-block {
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center;
  overflow-y: hidden;
  overflow-x: hidden;
  margin-top: 5%;
}
.course-name {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  color: rgb(51, 153, 255) !important;
}
.course-info-subheading {
  padding-top: 0px;
}
.overline {
  color: red;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.select-btn {
  padding: 0.5rem 0.5rem !important;
  border: transparent;
}
.course-description-text {
  margin: 0px;
  padding-top: 5px;
  padding-bottom: 5px;
}

/* .modal {
  height: min(500px, 90%) !important;
    max-height: min(500px, 90%) !important;
} */

.modal-actions {
  position: absolute;
  right: 0px;
}
.modal-course-list-row {
  height: 100%;
  width: 100%;
}
.modal-course-list-container {
  margin: 0px;
}
.modal-search {
  width: 90%;
}
.modal-course-list {
  margin-top: 1rem;
  width: 90%;
  min-height: calc(100% - 50px - 1rem);
  max-height: 50vh;
  overflow-y: auto;
}
.modal-course {
  margin-top: 1em;
  text-align: left;
}

.modal-course:hover {
  cursor: pointer;
  font-weight: 600;
}

.v-icon.v-icon::after {
  background-color: transparent !important;
}

.quick-add-icon {
  display: inline-block !important;
  vertical-align: top !important;
  margin-right: 0.5em;
}

.modal-course-list-display {
  margin-top: 1px; /* the way it is displayed does not align event if the height is aligned */
  display: inline-block;
  width: 90% !important;
  vertical-align: bottom !important;
}

.selectedCourseCode {
  font-weight: 600;
}
.course-title {
  padding-top: 0px;
}

.loading-card {
  padding: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: none !important;
}
</style>
