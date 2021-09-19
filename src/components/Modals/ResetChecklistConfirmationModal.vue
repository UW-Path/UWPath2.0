<template>
  <div>
    <!-- Required Course Block -->
    <v-icon medium @click="enableDialog()">mdi-refresh</v-icon>
    <!-- Course Popup Modal -->
    <v-dialog v-model="dialog" max-width="800">
      <v-card>
        <v-card-title>Reset Checklist?</v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <v-col class="text-align-left">
            Resetting your checklist will restore the default checklist for your
            program and all changes made by you will be lost.
          </v-col>
          <v-col class="text-align-left">
            <v-btn class="confirmation-button" @click="resetChecklist()" small
              >Continue</v-btn
            >
            <v-btn class="confirmation-button" @click="cancelReset()" small
              >Cancel</v-btn
            >
          </v-col>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import { mapActions } from "vuex";

export default {
  components: {},
  data() {
    return {
      dialog: false
    };
  },
  name: "ResetChecklistConfirmationModal",
  methods: {
    ...mapActions(["fillOutChecklist", "updateFirestore"]),
    enableDialog: function() {
      this.dialog = true;
    },
    resetChecklist() {
      this.fillOutChecklist();
      this.updateFirestore();
      this.dialog = false;
    },
    cancelReset() {
      this.dialog = false;
    }
  }
};
</script>

<style scoped>
.confirmation-button {
  margin-right: 2%;
}

.text-align-left {
  text-align: left;
}
</style>
