<template>
  <div class="background">
    <v-app-bar class="appbar" flat>
      <v-spacer></v-spacer>
      <v-btn text color="white" v-on:click="goToCourseSelectionPage">
        Plan Courses
      </v-btn>
      <v-btn text color="white" v-on:click="goToContactPage"> Contact </v-btn>
      <v-btn text color="white" v-on:click="goToAboutPage"> About </v-btn>
      <auth-button />
    </v-app-bar>
    <v-container class="container">
      <v-row no-gutters justify="center" align="center" class="center">
        <v-col class="hidden-md-and-down" justify="end"> </v-col>
        <v-col
          class="centerpiece-container"
          data-aos="fade-up"
          data-aos-duration="1200"
        >
          <div class="title"><h1>UWPath</h1></div>
          <div class="slogan"><h4>Plan your degree ahead</h4></div>
          <div class="slogan d-block d-sm-none" style="color:red">
            <h4>Please use a laptop or an Ipad for the best experience!</h4>
          </div>

          <!-- used to select the major -->
          <div class="autocomplete-container">
            <transition name="fade">
              <v-autocomplete
                v-if="selectingMajor"
                :items="
                  allMajors.map(e => {
                    return e.program_name;
                  })
                "
                v-on:change="setMajor"
                dense
                :allow-overflow="false"
                prepend-inner-icon="mdi-magnify"
                solo
                hide-details
                background-color="rgb(256, 256, 256)"
                class="autocomplete"
                label="Find your program"
                height="3rem"
                color="black"
              ></v-autocomplete>
            </transition>

            <!-- used to select the year after selecting the major -->
            <transition name="fade">
              <v-autocomplete
                v-if="selectingYear"
                :items="majorYearList"
                v-on:change="setYear"
                dense
                :allow-overflow="false"
                prepend-inner-icon="mdi-magnify"
                solo
                clearable
                hide-details
                background-color="rgb(256, 256, 256)"
                class="autocomplete"
                :label="getAcdemicYearLabel"
                height="3rem"
                color="black"
              ></v-autocomplete>
            </transition>
            <div class="findprogram" v-if="selectingMajor">
              <span @click="goToContactPage()" class="link"
                >Can't find your program?</span
              >
            </div>
          </div>

          <div v-if="selectingYear && !confirming">
            <div class="confirmation-msg">
              <v-icon
                medium
                color="green accent-4"
                @click="cancelYearSelection()"
                >mdi-arrow-left-circle</v-icon
              >
              <div class="helper-text">Cancel</div>
            </div>
          </div>

          <div v-if="confirming">
            <div class="confirmation-msg">
              <v-icon medium color="green accent-4" @click="confirm()"
                >mdi-checkbox-marked-circle</v-icon
              >
              <v-icon medium color="red" @click="cancelConfirm()"
                >mdi-close-circle</v-icon
              >
              <div class="helper-text">
                A major was selected in the past, do you wish to overwrite?
              </div>
            </div>
          </div>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from "vuex";
import AuthButton from "../components/AuthButton.vue";

export default {
  name: "Home",
  components: {
    AuthButton
  },
  data() {
    return {
      majorYearList: [],
      selectingMajor: true,
      selectingYear: false,
      confirming: false,
      selectedMajor: "",
      selectedYear: ""
    };
  },
  methods: {
    ...mapActions([
      "fetchRequirements",
      "fillOutChecklist",
      "fetchAcademicYearsOfMajor"
    ]),
    ...mapMutations([
      "clearTable",
      "removeMajor",
      "removeMinor",
      "removeOption"
    ]),
    setMajor(programName) {
      this.selectedMajor = programName;
      this.selectingMajor = false;
      this.selectingYear = true;

      this.fetchAcademicYearsOfMajor(this.selectedMajor).then(response => {
        this.majorYearList = response.data.years.map(ele => {
          return ele.year;
        });
      });
    },
    setYear(year) {
      this.selectedYear = year;
      if (this.majorRequirements.length > 0) this.confirming = true;
      else this.confirm();
    },
    confirm() {
      this.confirming = false;
      this.removeMajor();
      this.removeMinor(["ALL"]);
      this.removeOption();
      this.clearTable();
      this.fetchRequirements({
        newMajor: this.findMajorByProgram(this.selectedMajor),
        newMajorYear: this.selectedYear
      }).then(() => {
        this.fillOutChecklist();
      });
      this.$router.push("/CourseSelection");
    },
    cancelConfirm() {
      this.confirming = false;
      this.selectingYear = true;
    },
    cancelYearSelection() {
      this.selectingYear = false;
      this.selectingMajor = true;
    },
    goToAboutPage() {
      this.$router.push("/About");
    },
    goToCourseSelectionPage() {
      this.$router.push("/CourseSelection");
    },
    goToContactPage() {
      this.$router.push("/Contact");
    }
  },
  computed: {
    ...mapGetters(["allMajors", "findMajorByProgram", "majorRequirements"]),
    getAcdemicYearLabel() {
      return "Select Academic Year: " + this.selectedMajor;
    }
  },
  created() {
    if (
      sessionStorage.getItem("sessionStarted") == "true" &&
      this.majorRequirements.length > 0
    ) {
      sessionStorage.setItem("sessionStarted", false);
      this.goToCourseSelectionPage();
    }
  }
};
</script>

<style scoped>
/* TODO: REFACTOR THESE PATHS */
.appbar {
  position: fixed;
  right: 0;
  top: 0;
  background: transparent !important;
  border: none;
}

.title {
  color: ghostwhite;
  margin-bottom: 0.1em;
}

.slogan {
  color: ghostwhite;
  margin-bottom: 0.7em;
}

.centerpiece-container {
  margin-left: 20% !important;
  margin: 2%;
}

.center {
  text-align: left;
  height: 100%;
}

.container {
  height: 100%;
  width: 100%;
}

.autocomplete-container {
  max-width: 600px;
  width: 100%;
  min-width: 525px;
}

.link:hover {
  cursor: pointer;
}

.findprogram {
  text-align: end;
  color: ghostwhite;
  margin-top: 1rem;
  height: 3rem;
}

/* this is just a placeholder */
.additional-info {
  display: flex;
  background-color: grey;
  height: 650px;
  width: 450px;
  float: right;
  margin: 4rem;
}

.confirmation-msg {
  color: ghostwhite;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
  margin-left: 0.4em;
  display: flex;
}
.background {
  background: url(../assets/cover.png) !important;
  background-repeat: no-repeat !important;
  background-position: center !important;
  background-size: cover !important;
  height: 100%;
  overflow: hidden;
}

.helper-text {
  margin-left: 0.5em;
}

/* For fading in the auto complete box */

.fade-enter-active {
  transition: opacity 0.8s;
}
.fade-leave-active {
  transition: opacity 0s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>

<style>
/* trick to make the fonts in the dropdown smaller to prevent dropdown content overflow */
.v-autocomplete__content {
  width: 35% !important;
  max-height: 40% !important;
}
</style>
