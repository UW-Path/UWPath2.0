<template>
  <div>
    <v-btn @click="enableDialog()" small
      >Add a minor, option, etc
      <v-icon style="margin-left: 0.2em" small
        >mdi-plus-circle-outline</v-icon
      ></v-btn
    >
    <v-dialog v-model="dialog" max-width="800" @click:outside="close()">
      <v-card>
        <v-card-title>
          Specify Your Degree
          <v-tooltip top class="academic-year-notif-tooltip">
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon v-bind="attrs" v-on="on">
                <v-icon>
                  mdi-information-outline
                </v-icon>
              </v-btn>
            </template>
            <div>
              All programs selected is based on the offerings in the
              <b>{{ this.calendarYear }}</b> academic year
            </div>
          </v-tooltip>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text
          ><v-row class="modal-course-list-row" col>
            <v-col align="center flex-centerise">
              <div class="auto-complete-title">Major</div>
              <v-autocomplete
                :disabled="inConfirmation"
                :items="getMajorList()"
                v-model="selectedMajor"
                v-on:change="selectMajor"
                dense
                prepend-inner-icon="mdi-magnify"
                solo
                hide-details
                background-color="#f2f2f2"
                class="autocomplete"
                :label="noProgram"
                height="3rem"
                color="black"
              ></v-autocomplete>
            </v-col>
          </v-row>
          <v-row class="modal-course-list-row">
            <v-col align="center flex-centerise">
              <div class="auto-complete-title">Minor</div>
              <v-autocomplete
                :disabled="inConfirmation"
                :items="getMinorList()"
                v-model="selectedMinors"
                dense
                prepend-inner-icon="mdi-magnify"
                solo
                hide-details
                background-color="#f2f2f2"
                class="autocomplete"
                :label="noProgram"
                height="3rem"
                color="black"
                multiple
              ></v-autocomplete>
            </v-col>
          </v-row>
          <v-row class="modal-course-list-row">
            <v-col align="center flex-centerise">
              <div class="auto-complete-title">Joint/Option</div>
              <v-autocomplete
                small
                :disabled="inConfirmation"
                :items="getSpecList()"
                v-model="selectedSpec"
                v-on:change="selectSpec"
                dense
                prepend-inner-icon="mdi-magnify"
                solo
                hide-details
                background-color="#f2f2f2"
                class="autocomplete"
                :label="noProgram"
                height="3rem"
                color="black"
              ></v-autocomplete>
            </v-col>
          </v-row>
          <v-row class="modal-course-list-row">
            <v-col class="confirm-container" v-if="!inConfirmation">
              <v-btn @click="select()" :disabled="inConfirmation" small
                >Select Requirement</v-btn
              >
            </v-col>
            <v-col
              class="flex-centerise confirm-container"
              v-if="inConfirmation"
            >
              <div class="confirm-elements confirm-text">
                Confirm? (changes will be overwritten)
              </div>
              <v-icon large color="light-green" @click="confirmSelection()"
                >mdi-checkbox-marked-circle</v-icon
              >
              <v-icon large color="red" @click="cancelSelection()"
                >mdi-close-circle</v-icon
              >
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import axios from "axios";
import { mapGetters, mapActions, mapMutations } from "vuex";
import { ProgramInfo } from "../../models/ProgramInfoModel";
import { backend_api } from "../../backendAPI";

export default {
  data() {
    return {
      dialog: false,
      inConfirmation: false,
      noProgram: "None",
      selectedMajor: "",
      selectedMinors: [],
      selectedSpec: "",
      lastSelectedMajor: "",

      // Updated list of available minors/specs based on selected Major
      newMinorsList: [],
      newSpecList: []
    };
  },
  name: "ProgramSelectionModal",
  mounted() {
    this.selectedMajor = this.majorRequirements.length
      ? this.majorRequirements[0].info.program_name
      : "";
    this.selectedMinors = this.minorRequirements
      ? this.minorRequirements.map(x => x.info.program_name)
      : [];
    this.selectedSpec =
      this.specRequirements && this.specRequirements.length > 0
        ? this.specRequirements[0].info.program_name
        : "";
  },
  methods: {
    ...mapActions(["fetchRequirements", "fillOutChecklist"]),
    ...mapMutations([
      "clearTable",
      "clearMinorFromTable",
      "clearOptionTable",
      "removeMajor",
      "removeMinor",
      "removeOption",
      "updateCacheTime"
    ]),
    enableDialog: function() {
      this.selectedMajor = this.majorRequirements.length
        ? this.majorRequirements[0].info.program_name
        : "";
      this.selectedMinors = this.minorRequirements
        ? this.minorRequirements.map(x => x.info.program_name)
        : [];
      this.selectedSpec =
        this.specRequirements && this.specRequirements.length > 0
          ? this.specRequirements[0].info.program_name
          : "";
      this.dialog = true;
      this.inConfirmation = false;
      if (
        this.majorRequirements.length > 0 &&
        this.lastSelectedMajor !== this.majorRequirements[0].info.program_name
      ) {
        this.selectMajor(this.majorRequirements[0].info.program_name);
      }
    },
    select: function() {
      this.inConfirmation = true;
    },
    selectMajor: function(major) {
      if (this.majorRequirements.length > 0) {
        this.lastSelectedMajor = major;
      }
      axios
        .get(backend_api + "/api/requirements/requirements", {
          params: { major: major, minors: "", option: "" }
        })
        .then(response => {
          this.selectedMajor = major;
          this.selectedSpec = this.noProgram;
          this.selectedMinors = [];
          this.newMinorsList = response.data["minor_list"].map(minor => {
            return new ProgramInfo(minor);
          });
          this.newSpecList = response.data["option_list"].map(spec => {
            return new ProgramInfo(spec);
          });
          this.updateCacheTime();
        })
        .catch(err => {
          console.error(err);
        });
    },
    selectSpec: function(spec) {
      this.selectedSpec = spec;
      this.updateCacheTime();
    },
    getMajorList: function() {
      return this.allMajors.map(e => {
        return e.program_name;
      });
    },
    getMinorList: function() {
      return this.newMinorsList.map(e => {
        return e.program_name;
      });
    },
    getSpecList: function() {
      return [this.noProgram].concat(
        this.newSpecList.map(e => {
          return e.program_name;
        })
      );
    },
    findOptionByProgram: function(program) {
      const changedMajor =
        !this.majorRequirements.length ||
        this.selectedMajor !== this.majorRequirements[0].info.program_name;
      const programSpecs = changedMajor
        ? this.newSpecList
        : this.allSpecializations;
      return programSpecs.find(obj => {
        return program === obj.program_name;
      });
    },
    confirmSelection: function() {
      let changeMajor =
        this.selectedMajor !== this.noProgram &&
        (!this.majorRequirements.length ||
          this.selectedMajor !== this.majorRequirements[0].info.program_name)
          ? this.findMajorByProgram(this.selectedMajor)
          : undefined;

      let addedMinors = [];
      for (let minor of this.selectedMinors) {
        let inPrev = false;
        for (let prev of this.minorRequirements) {
          if (minor === prev.info.program_name) inPrev = true;
        }
        if (!inPrev) {
          addedMinors.push(minor);
        }
      }
      let removedMinors = [];
      let prevMinors = [];
      for (let prev of this.minorRequirements) {
        let isHere = false;
        for (let minor of this.selectedMinors) {
          if (minor === prev.info.program_name) isHere = true;
        }
        if (!isHere) {
          removedMinors.push(prev.info.program_name);
        }
        prevMinors.push(prev.info.program_name);
      }
      let changeOption =
        this.selectedSpec !== this.noProgram &&
        (!this.specRequirements.length ||
          this.selectedSpec !== this.specRequirements[0].info.program_name)
          ? this.findOptionByProgram(this.selectedSpec)
          : undefined;
      //remove current major/minor/options if none is chosen or if it needs to be changed
      if (changeMajor) {
        this.removeMajor();
        this.clearTable();
      } else if (this.selectedMajor === this.noProgram) {
        this.removeMajor();
        this.removeMinor(prevMinors);
        this.removeOption();
        this.clearTable();
      }
      if (removedMinors.length) {
        this.removeMinor(removedMinors);
        this.clearMinorFromTable(removedMinors);
      }
      if (changeOption || this.selectedSpec === this.noProgram) {
        this.removeOption();
        this.clearOptionTable();
      }
      this.fetchRequirements({
        newMajor: changeMajor,
        newMinor: addedMinors.join(),
        newSpecialization: changeOption
      }).then(() => {
        this.selectedMajor = this.majorRequirements.length
          ? this.majorRequirements[0].info.program_name
          : "";
        this.selectedMinors = this.minorRequirements
          ? this.minorRequirements.map(x => x.info.program_name)
          : [];
        this.selectedSpec =
          this.specRequirements && this.specRequirements.length > 0
            ? this.specRequirements[0].info.program_name
            : "";
        this.fillOutChecklist();
      });

      this.newMinorsList = [];
      this.newSpecList = [];
      this.dialog = false;
      this.inConfirmation = false;

      this.updateCacheTime();
    },
    cancelSelection: function() {
      this.inConfirmation = false;
    },
    close() {
      this.selectedMajor = this.majorRequirements.length
        ? this.majorRequirements[0].info.program_name
        : "";
      this.selectedMinors = this.minorRequirements
        ? this.minorRequirements.map(x => x.info.program_name)
        : [];
      this.selectedSpec =
        this.specRequirements && this.specRequirements.length > 0
          ? this.specRequirements[0].info.program_name
          : "";
      this.dialog = false;
      this.inConfirmation = false;
    }
  },
  computed: mapGetters([
    "allMajors",
    "allMinors",
    "allSpecializations",
    "findMajorByProgram",
    "findMinorByProgram",
    "majorRequirements",
    "minorRequirements",
    "specRequirements",
    "calendarYear"
  ])
};
</script>

<style scoped>
.modal-course-list-row {
  margin-left: 1%;
  margin-right: 1%;
}

.course-title {
  padding-top: 0px;
}

.flex-centerise {
  vertical-align: middle;
}

.title {
  text-align: left;
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.confirm-container {
  text-align: left;
}

.confirm-elements {
  display: inline-block;
}

.confirm-button {
  margin-right: 0;
}

.confirm-text {
  color: black;
  margin-right: 0.5rem;
}

.select-btn {
  height: 100%;
}

.auto-complete-title {
  text-align: left;
  color: black;
  font-size: 1.2em;
  margin-bottom: 0.3em;
}

.add-major-btn {
  margin-right: 0.3em;
  color: #5c8ce9 !important;
}

.academic-year-notif-tooltip {
  display: inline-block;
  margin-right: 0.3rem;
}
</style>
