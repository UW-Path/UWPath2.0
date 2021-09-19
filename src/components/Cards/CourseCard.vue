<template>
  <v-card class="course-card">
    <!-- for single / selected course cards -->
    <template
      v-if="
        this.courseData.selected_course &&
          this.courseData.selected_course.course_code !== 'WAITING'
      "
    >
      <v-list-item three-line>
        <v-list-item-content>
          <div class="overline mb-1">
            <div v-if="!this.courseData.inRequirementBar">
              <v-tooltip
                top
                open-delay="300"
                max-width="350px"
                v-if="this.courseData.satisfiesMajorReq"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-chip
                    color="light-blue"
                    label
                    x-small
                    text-color="white"
                    class="chip"
                    v-bind="attrs"
                    v-on="on"
                  >
                    M
                  </v-chip>
                </template>
                <span>Major</span>
              </v-tooltip>

              <v-tooltip
                top
                open-delay="300"
                max-width="350px"
                v-if="this.courseData.satisfiesMinorReq"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-chip
                    color="light-green"
                    label
                    x-small
                    text-color="white"
                    class="chip"
                    v-bind="attrs"
                    v-on="on"
                  >
                    Mi
                  </v-chip>
                </template>
                <span>Minor</span>
              </v-tooltip>

              <v-tooltip
                top
                open-delay="300"
                max-width="350px"
                v-if="this.courseData.satisfiesSpecializationReq"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-chip
                    color="rgb(0,204,204)"
                    label
                    x-small
                    text-color="white"
                    class="chip"
                    v-bind="attrs"
                    v-on="on"
                  >
                    O
                  </v-chip>
                </template>
                <span>Option/Specialization</span>
              </v-tooltip>

              <v-tooltip
                top
                open-delay="300"
                max-width="350px"
                v-if="this.courseData.number_of_choices > 1"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-chip
                    color="grey"
                    label
                    x-small
                    text-color="white"
                    class="chip"
                    v-bind="attrs"
                    v-on="on"
                  >
                    C
                  </v-chip>
                </template>
                <span>Choice (Multiple courses to select from)</span>
              </v-tooltip>

              <v-tooltip
                top
                open-delay="300"
                max-width="350px"
                v-if="this.courseData.user_selected"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-chip
                    color="orange"
                    label
                    x-small
                    text-color="white"
                    class="chip"
                    v-bind="attrs"
                    v-on="on"
                  >
                    A
                  </v-chip>
                </template>
                <span>Added course</span>
              </v-tooltip>

              <v-tooltip
                top
                open-delay="300"
                max-width="350px"
                v-if="this.courseData.overridden"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-chip
                    label
                    x-small
                    text-color="white"
                    class="chip"
                    v-bind="attrs"
                    v-on="on"
                  >
                    OR
                  </v-chip>
                </template>
                <span>Course overridden</span>
              </v-tooltip>
            </div>
            <v-spacer></v-spacer>
            <v-icon icon class="delete-btn" x-small @click="deleteCourse()"
              >mdi-close</v-icon
            >
          </div>
          <v-list-item-title class="course-title">
            {{ courseData.selected_course.course_code }}
          </v-list-item-title>
          <v-list-item-subtitle class="course-desc">{{
            courseData.selected_course.course_name | truncate(30, "...")
          }}</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <v-tooltip bottom open-delay="300" max-width="350px">
        <template v-slot:activator="{ on, attrs }">
          <v-icon
            @click.stop="toggleOverride(courseIndex, termIndex)"
            v-bind:class="{
              course_card_prereqs_met:
                courseData.prereqs_met ||
                courseData.inRequirementBar ||
                courseData.overridden,
              course_card_prereqs_failed:
                !courseData.prereqs_met &&
                !courseData.inRequirementBar &&
                !courseData.overridden
            }"
            small
            class="alert-icon"
            v-bind="attrs"
            v-on="on"
          >
            mdi-alert
          </v-icon>
        </template>
        <span
          >{{ courseData.validation_message }} <br />
          Click on warning sign to override!</span
        >
      </v-tooltip>
    </template>
    <!-- for muliple unselected course cards -->
    <template v-else>
      <v-list-item>
        <v-list-item-content>
          <div class="overline mb-1">
            <div v-if="courseData.number_of_choices > 1">
              Select {{ courseData.number_of_courses }} of
            </div>
            <v-spacer></v-spacer>
            <v-icon icon class="delete-btn" x-small @click="deleteCourse()"
              >mdi-close</v-icon
            >
          </div>
          <div v-if="courseData.number_of_choices <= 3">
            <template
              v-for="(code, index) in courseData.course_codes_raw
                .split(/,\s|\sor\s|,/)
                .slice(0, 3)"
            >
              <v-list-item-subtitle :key="index" v-if="isSelected(code)">{{
                code
              }}</v-list-item-subtitle>
              <v-list-item-subtitle class="select-font" :key="index" v-else>{{
                code
              }}</v-list-item-subtitle>
            </template>
          </div>
          <div v-else-if="courseData.number_of_choices > 3 && courseData.group">
            <template
              v-for="(code, index) in courseData.course_codes_raw
                .split(/,\s|\sor\s|,/)
                .slice(0, 3)"
            >
              <v-list-item-subtitle :key="index" v-if="isSelected(code)">{{
                code
              }}</v-list-item-subtitle>
              <v-list-item-subtitle
                class="select-font"
                :key="index"
                v-else-if="index == 0"
                >{{ courseData.group }}</v-list-item-subtitle
              >
            </template>
          </div>
          <div v-else>
            <template
              v-for="(code, index) in courseData.course_codes_raw
                .split(/,\s|\sor\s|,/)
                .slice(0, 3)"
            >
              <v-list-item-subtitle :key="index" v-if="isSelected(code)">{{
                code
              }}</v-list-item-subtitle>
              <v-list-item-subtitle class="select-font" :key="index" v-else
                >{{ code }}<b v-if="index == 2">...</b>
              </v-list-item-subtitle>
            </template>
          </div>
        </v-list-item-content>
      </v-list-item>
    </template>
  </v-card>
</template>

<script>
import { mapActions, mapMutations } from "vuex";
export default {
  name: "CourseCard",
  order: 1,
  components: {},
  props: {
    courseData: Object,
    onSelectionBar: Boolean,
    termIndex: Number,
    courseIndex: Number
  },
  data() {
    return {};
  },
  methods: {
    ...mapMutations(["validateCourses"]),
    ...mapActions([
      "toggleCourseOverride",
      "updateChecklist",
      "updateFirestore"
    ]),
    deleteCourse() {
      this.courseData.clickedDelete = true;
      this.validateCourses();
      this.updateChecklist();
      this.updateFirestore();
    },
    toggleOverride(courseIndex, termIndex) {
      this.toggleCourseOverride({ courseIndex, termIndex });
    },
    isSelected(courseCode) {
      if (!this.courseData.selected_course) return false;
      return courseCode == this.courseData.selected_course.course_code;
    }
  }
};
</script>

<style scoped>
.card {
  margin-top: 0.5rem;
  text-align: left;
}

.overline {
  color: red;
  display: flex;
  align-items: center;
}

.delete-btn {
  display: block;
  margin: 0px;
  right: 2%;
}

.delete-btn:hover {
  color: rgb(255, 122, 122);
}

.course_card_prereqs_met {
  visibility: hidden;
}

.course_card_prereqs_failed {
  visibility: visible;
}

.course-card {
  height: 5.3rem;
  padding: 1%;
  border-radius: 0.5em !important;
}

.course-title {
  font-size: 1em;
  margin-top: 0.1em;
}

.v-list-item__content {
  margin-top: -0.4em !important;
}

.v-list-item {
  padding: 0 0.7em;
}

.select-font {
  margin-top: 0.1em;
  font-size: 0.8em;
}

.alert-icon {
  position: absolute !important;
  color: #ffcc00;
  bottom: 0.3em;
  right: 0.7em;
}

.course-desc {
  font-size: 0.8em;
  margin-bottom: 1em;
  max-width: 9.5em;
}
</style>
