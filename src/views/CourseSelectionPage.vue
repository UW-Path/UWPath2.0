<template>
  <v-container class="course-selection-container">
    <program-selection-bar class="program-selection-bar" />
    <v-tabs
      background-color="transparent"
      hide-slider
      vertical
      dark
      class="primary-tabs"
    >
      <v-tooltip right open-delay="300" max-width="250px">
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            class="tab-icon tab-button"
            v-bind="attrs"
            v-on="on"
            @click="scrollTable()"
          >
            <v-icon x-large>mdi-calendar-range-outline</v-icon>
          </v-btn>
        </template>
        <span>Plan Course</span>
      </v-tooltip>

      <v-tooltip right open-delay="300" max-width="250px">
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            class="tab-icon tab-button"
            v-bind="attrs"
            v-on="on"
            @click="scrollChecklist()"
          >
            <v-icon x-large>mdi-checkbox-outline</v-icon>
          </v-btn>
        </template>
        <span>Degree Checklist</span>
      </v-tooltip>

      <v-tooltip right open-delay="300" max-width="250px">
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            class="tab-icon tab-button"
            v-bind="attrs"
            v-on="on"
            @click="exportXLS()"
          >
            <v-icon x-large>mdi-download-outline</v-icon>
          </v-btn>
        </template>
        <span>Download plan to CSV</span>
      </v-tooltip>

      <v-spacer></v-spacer>

      <v-tooltip right open-delay="300" max-width="250px">
        <template v-slot:activator="{ on, attrs }">
          <v-btn
            class="tab-icon tab-button"
            v-bind="attrs"
            v-on="on"
            @click="openBugTroubleshootModal()"
          >
            <v-icon x-large>mdi-bug</v-icon>
          </v-btn>
        </template>
        <span>Page not working as expected?</span>
      </v-tooltip>

      <!-- this is a trick to get the v-tab-item to display, the controls are handled by buttons -->
      <v-tab v-show="false"></v-tab>

      <v-tab-item class="primary-tab transparent">
        <v-row class="main-row" v-show="inTable">
          <v-col class="side-bar" lg="2" md="3" sm="3">
            <side-bar />
          </v-col>
          <v-col class="main-panel" lg="10" md="9" sm="9">
            <course-plan :allCourses="allCourses" />
          </v-col>
        </v-row>
        <v-row v-show="!inTable" class="main-row" id="checklist-row">
          <v-col class="main-panel">
            <program-checklist />
          </v-col>
        </v-row>
      </v-tab-item>
    </v-tabs>
    <v-dialog v-model="openBugModal" max-width="800">
      <TroubleShootModalContent />
    </v-dialog>
  </v-container>
</template>

<script>
import CoursePlan from "../components/CourseSelectionPage/CoursePlan.vue";
import ProgramSelectionBar from "../components/CourseSelectionPage/ProgramSelectionBar.vue";
import ProgramChecklist from "../components/ProgramChecklistPage/ProgramChecklist.vue";
import TroubleShootModalContent from "../components/Modals/TroubleShootModalContent.vue";
import { CourseInfo } from "../models/courseInfoModel";
import SideBar from "../components/CourseSelectionPage/SideBar.vue";
import TrieSearch from "trie-search";
import axios from "axios";
import { backend_api } from "../backendAPI";
import { mapActions } from "vuex";

export default {
  name: "CourseSelection",
  components: {
    CoursePlan,
    ProgramSelectionBar,
    SideBar,
    ProgramChecklist,
    TroubleShootModalContent
  },
  data: () => ({
    inTable: true,
    openBugModal: false,
    allCourses: new TrieSearch(["course_code", "course_number"], {
      idFieldOrFunction: function(course) {
        return course.course_id + course.course_code;
      }
    })
  }),
  methods: {
    ...mapActions(["export"]),
    exportPDF() {
      this.export({ PDF: true, XLS: false });
    },
    exportXLS() {
      this.export({ PDF: false, XLS: true });
    },
    scrollTable() {
      this.inTable = true;
    },
    scrollChecklist() {
      this.inTable = false;
    },
    openBugTroubleshootModal() {
      this.openBugModal = true;
    }
  },
  created() {
    axios
      .get(backend_api + "/api/course-info/filter", {
        params: {
          start: 0,
          end: 1000,
          code: "none"
        }
      })
      .then(response => {
        response.data.sort((course1, course2) => {
          if (course1.course_code < course2.course_code) return -1;
          else if (course1.course_code > course2.course_code) 1;
          else return 0;
        });
        this.allCourses.addAll(
          response.data.map(course => {
            return new CourseInfo(course);
          })
        );
      })
      .catch(error => {
        console.error(error);
      });
  }
};
</script>

<style src="vue-slim-tabs/themes/default.css"></style>
<style scoped>
.primary-tabs-container {
  min-height: calc(100vh - 64px);
}

.program-selection-bar {
  margin-top: 0.5rem !important;
  margin-bottom: 0.5rem !important;
}

.primary-tabs {
  font-size: 0.9em !important;
  height: calc(100vh - 2rem - 64px - 10px);
  padding-right: 10px;
}

.tab-icon {
  margin-bottom: 1rem !important;
}

.tab-button {
  background-color: transparent !important;
  box-shadow: none !important;
  height: 48px !important;
  opacity: 0.6;
}

.download-button:hover {
  opacity: 1;
}

.primary-tab {
  height: 100%;
}

.top-margin {
  margin-top: 1em;
}

.main-row {
  margin: 0;
  max-width: calc(100vw - 90px) !important;
  height: 100%;
  border-radius: 1em;
  overflow-y: hidden;
  background: white;
}

#checklist-row {
  font-size: 0.9em !important;
  background: white;
}

.main-panel {
  padding: 0;
  height: 100%;
}

.course-selection-container {
  padding: 0px;
  min-height: 100%;
  min-width: 100%;
  background: linear-gradient(
    22deg,
    rgba(51, 64, 78, 1) 0%,
    rgba(43, 67, 93, 1) 35%,
    rgba(129, 152, 171, 1) 100%
  );
}

.checklist-side-bar {
  height: 100%;
  overflow-y: auto;
  background-color: #eeeeee;
  padding-bottom: 0;
}

.side-bar {
  border-radius: 1em;
  display: flex;
  max-height: 100%;
  overflow-y: auto;
  padding: 0;
}
</style>

<style>
/* overwriting vueify classes  */
.v-window__container {
  height: 100% !important;
}

.v-tabs-items {
  background: transparent !important;
}
</style>
