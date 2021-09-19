<template>
  <div>
    <v-card class="card-container">
      <v-list-item @click.native="enableDialog()">
        <v-list-item-content>
          <v-list-item-subtitle class="card-content">
            <span> Add a Course </span>
            <v-icon small class="add-icon">mdi-plus-circle</v-icon>
          </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
    </v-card>

    <v-dialog v-model="dialog">
      <v-card>
        <v-container fluid class="modal-course-list-container">
          <v-row class="modal-course-list-row">
            <v-col align="center">
              <v-text-field
                class="modal-search"
                v-on:input="onSearchChange"
                label="Search for a Course"
                prepend-inner-icon="mdi-magnify"
                hide-details="true"
                single-line
                outlined
                dense
              ></v-text-field>
              <div
                v-if="filteredCourseList.length > 0"
                class="modal-course-list"
              >
                <div
                  class="modal-course"
                  v-bind:class="{
                    'modal-selected-course':
                      course.course_code === selectedCourse.course_code
                  }"
                  v-for="course in filteredCourseList.slice(0, 50)"
                  :key="course.course_id + course.course_code"
                >
                  <v-icon
                    class="quick-add-icon"
                    @click="quickSelectAddedCourse(course)"
                    >mdi-plus</v-icon
                  >
                  <div
                    class="modal-course-list-display"
                    @click="onCourseSelection(course)"
                  >
                    {{ course.course_code + ": " + course.course_name }}
                  </div>
                </div>
              </div>
              <div v-else class="modal-course-list">
                <p>
                  No courses match your search. Would you like to add a custom
                  course code to your plan named "{{
                    searchtext.toUpperCase()
                  }}"?
                </p>
                <v-btn class="add-custom-btn" @click="selectCustomCourse" small
                  >Add "{{ searchtext.toUpperCase() }}"</v-btn
                >
              </div>
            </v-col>
            <v-col
              v-if="selectedCourse"
              class="course-description-col"
              align="left"
            >
              <v-card-title class="course-title">
                {{ selectedCourse.course_code }}
                <v-spacer></v-spacer>
                <template>
                  <v-btn
                    class="select-btn"
                    text
                    @click="selectAddedCourse"
                    icon
                    large
                  >
                    <v-icon>mdi-plus-circle</v-icon>
                  </v-btn>
                </template>
              </v-card-title>
              <v-card-subtitle class="course-name">
                {{ selectedCourse.course_name }}
              </v-card-subtitle>
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
              <v-card-text>{{
                selectedCourse.info +
                  (selectedCourse.offering.length === 0
                    ? ""
                    : " Offered in: " + selectedCourse.offering + ". ") +
                  (selectedCourse.online ? "Also offered online." : "")
              }}</v-card-text>
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
                  selectedCourse.antireqs && selectedCourse.antireqs.length > 0
                "
                >{{ "Antirequisites: " + selectedCourse.antireqs }}</v-card-text
              >
              <v-card-text
                class="course-description-text"
                v-if="selectedCourse.coreqs && selectedCourse.coreqs.length > 0"
                >{{ "Corequisites: " + selectedCourse.coreqs }}</v-card-text
              >
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapMutations, mapActions } from "vuex";
import { CourseRequirement } from "../../models/courseRequirementModel";
import { CourseInfo } from "../../models/courseInfoModel";
import TrieSearch from "trie-search";

export default {
  name: "AddCourseCard",
  components: {},
  props: {
    termIndex: Number,
    allCourses: Object
  },
  data() {
    return {
      dialog: false,
      searchtext: "1",
      selectedCourse: null,
      filteredCourseList: []
    };
  },
  methods: {
    ...mapMutations(["addCourse", "validateCourses"]),
    ...mapActions(["updateChecklist", "updateFirestore"]),
    enableDialog() {
      this.dialog = true;
    },
    onCourseSelection(course) {
      this.selectedCourse = course;
    },
    onSearchChange(event) {
      if (event === "") {
        this.filteredCourseList = this.allCourses.get("1").slice(0, 50);
      } else {
        this.searchtext = event;
        var digitSplit = event.replace(/\s/g, "").match(/[\d.]+|\D+/g);
        var filterArray = [];
        if (digitSplit.length > 1) {
          filterArray = [digitSplit[0], digitSplit.splice(1).join("")];
        } else {
          filterArray = digitSplit;
        }
        this.filteredCourseList = this.allCourses
          .get(filterArray, TrieSearch.UNION_REDUCER)
          .slice(0, 50);
      }
    },
    selectCustomCourse() {
      let customCourse = new CourseInfo({
        course_code: this.searchtext.toUpperCase(),
        course_name: "Custom Added Course",
        info: "This course was not found by UWPath and was entered manually.",
        credit: 0.5
      });
      let req = new CourseRequirement({
        selected_course: customCourse,
        user_selected: true,
        inRequirementBar: false,
        allowedInRequirementBar: false,
        number_of_courses: 1,
        number_of_choices: 1,
        credits_required: 0.5,
        additional_requirements: "",
        prereqs_met: true
      });
      this.dialog = false;
      this.addCourse({ newRequirement: req, termIndex: this.termIndex });
      this.validateCourses();
      this.updateChecklist();
      this.updateFirestore();
    },
    selectAddedCourse() {
      var addedCourse = this.selectedCourse;
      let req = {
        selected_course: addedCourse,
        user_selected: true,
        inRequirementBar: false,
        allowedInRequirementBar: false,
        number_of_courses: 1,
        number_of_choices: 1,
        credits_required: 0.5,
        additional_requirements: "",
        prereqs_met: true
      };
      var newRequirement = new CourseRequirement(req);
      this.dialog = false;
      this.addCourse({
        newRequirement: newRequirement,
        termIndex: this.termIndex
      });
      this.validateCourses();
      this.updateChecklist();
      this.updateFirestore();
    },
    quickSelectAddedCourse(course) {
      this.selectedCourse = course;
      var addedCourse = this.selectedCourse;
      let req = {
        selected_course: addedCourse,
        user_selected: true,
        inRequirementBar: false,
        allowedInRequirementBar: false,
        number_of_courses: 1,
        number_of_choices: 1,
        credits_required: 0.5,
        additional_requirements: "",
        prereqs_met: true
      };
      var newRequirement = new CourseRequirement(req);
      this.dialog = false;
      this.addCourse({
        newRequirement: newRequirement,
        termIndex: this.termIndex
      });
      this.validateCourses();
      this.updateChecklist();
      this.updateFirestore();
    }
  },
  async mounted() {
    // Wait until allCourses has been populated
    while (this.allCourses.get("1").length === 0) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    this.filteredCourseList = this.allCourses.get("1").slice(0, 50);
    this.selectedCourse = this.filteredCourseList[0];
  }
};
</script>

<style scoped>
.add-custom-btn {
  margin: 1em;
}
.card-container {
  margin-top: 0.75rem;
  opacity: 0.75;
  outline-color: black;
  background-color: white;
  border-radius: 0.5em !important;
}

.course-list-block {
  display: flex;
  width: 100%;
  /* height: 50px; */
  justify-content: center;
  align-items: center;
  overflow-y: hidden;
  overflow-x: hidden;
  margin-top: 5%;
}

.course-description-col {
  max-height: 310px;
  overflow-y: auto;
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
  padding: 0px !important;
}

.course-description-text {
  margin: 0px;
  padding-top: 5px;
  padding-bottom: 5px;
}

.quick-add-icon {
  display: inline-block !important;
  vertical-align: top !important;
  margin-right: 0.5em;
}

.modal-actions {
  position: absolute;
  right: 0px;
}

.modal-course-list-row {
  height: 100%;
  width: 100%;
}

.modal-course-list-container {
  height: 330px;
  margin: 0px;
}

.modal-course-list-display {
  margin-top: 1px; /* the way it is displayed does not align event if the height is aligned */
  display: inline-block;
  width: 90% !important;
  vertical-align: bottom !important;
}

.modal-search {
  width: 90%;
}

.modal-course-list {
  margin-top: 1rem;
  width: 90%;
  max-height: 235px;
  overflow-y: auto;
}

.modal-course {
  margin-top: 1em;
  text-align: left;
}

.modal-course:hover {
  cursor: pointer;
  font-weight: 550;
}

.modal-selected-course {
  font-weight: 550;
}

.course-title {
  padding-top: 0px;
}

.selected-course-code {
  font-weight: bold;
}

.card-container:hover {
  opacity: 1;
}

.card-content {
  display: flex;
  justify-content: center;
}

.add-icon {
  padding-left: 0.25rem;
}

.v-icon.v-icon::after {
  background-color: transparent !important;
}
</style>
