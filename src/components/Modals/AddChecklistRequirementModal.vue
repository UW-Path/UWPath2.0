<template>
  <div>
    <!-- Required Course Block -->
    <v-btn small class="create-req-button" @click="enableDialog()">
      Add New Requirement
      <v-icon class="add-icon" small>mdi-plus-circle-outline</v-icon>
    </v-btn>
    <!-- Course Popup Modal -->
    <v-dialog v-model="dialog" max-width="800">
      <v-card>
        <v-card-title>Create a New Requirement</v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <v-form ref="form" v-model="valid" :lazy-validation="true">
            <v-text-field
              style="padding-bottom:0.5em"
              v-model="reqCourseCodes"
              label="Course Codes (Sepereated by comma)"
              :rules="courseCodesRules"
              required
            ></v-text-field>
            <v-text-field
              type="number"
              style="padding-bottom:1em"
              v-model="creditsRequired"
              label="Number of Credits Required"
              :rules="creditRules"
              required
            ></v-text-field>
          </v-form>
          <div style="display:flex">
            <v-btn @click="createRequirement()" small>Create Requirement</v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapActions, mapMutations } from "vuex";
import { v4 as uuidv4 } from "uuid";
import { CourseRequirement } from "../../models/courseRequirementModel";

export default {
  components: {},
  data() {
    return {
      valid: true,
      reqCourseCodes: "",
      creditsRequired: 0.5,
      courseCodesRules: [v => !!v || "Course codes are required"],
      creditRules: [
        v => v > 0 || "A positive number of credits must be required"
      ],
      dialog: false
    };
  },
  name: "AddChecklistRequirementModal",
  methods: {
    ...mapActions(["updateFirestore"]),
    ...mapMutations(["addChecklistRequirement"]),
    enableDialog: function() {
      this.dialog = true;
    },
    createRequirement() {
      if (this.$refs.form.validate()) {
        let newRequirement = new CourseRequirement({
          inRequirementBar: false,
          course_codes_raw: this.reqCourseCodes.toUpperCase(),
          allowedInRequirementBar: false,
          number_of_courses: this.creditsRequired * 2,
          number_of_choices: 4,
          credits_required: this.creditsRequired,
          additional_requirements: "",
          prereqs_met: false,
          id: uuidv4()
        });
        this.addChecklistRequirement({
          newRequirement: newRequirement,
          program: this.program,
          programType: this.programType
        });
        this.dialog = false;
        this.updateFirestore();
      }
    }
  },
  props: ["program", "programType"]
};
</script>

<style scoped>
.add-icon {
  margin-left: 2%;
}
.create-req-button {
  background-color: white;
  margin-top: 1%;
  box-shadow: none;
}
</style>
