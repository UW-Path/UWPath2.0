<template>
  <div class="contact-page-container">
    <v-app-bar
      style="background: linear-gradient(38.92deg, #8198AB 36.61%, #2B435D 102.9%), #4A75AD;"
    >
      <router-link to="/">
        <span class="logo">
          <UWPathIcon />
        </span>
      </router-link>
      <v-toolbar-title class="uwpath-title">
        <span class="link" @click="goToHome()"> UWPath</span>
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn text color="white" v-on:click="goToCourseSelectionPage">
        Plan Courses
      </v-btn>
      <v-btn text color="white" v-on:click="goToAboutUsPage"> About </v-btn>
      <auth-button />
    </v-app-bar>
    <v-container
      class="contact-page-content-container"
      data-aos="fade-up"
      data-aos-duration="1200"
    >
      <h2 class="header">Help us Improve our Site!</h2>
      <div class="contact-page-info">
        <p>
          We strive to provide our users with as accurate of an experience as we
          can. However, with the thousands of courses the University of Waterloo
          offers, we acknowledge that sometimes we will get it wrong.
        </p>
        <p>That's why your feedback is critical to us.</p>
        <p>
          If you see any course or degree information that looks incorrect,
          report it to us below and we will fix it right away.
        </p>
        <p>
          <i
            >Note: We recognize many majors in the Faculty of Arts aren't
            available right now. We hope to fully support majors and minors
            soon!</i
          >
        </p>
        <p>
          Check out our <b><a href="https://github.com/UW-Path">Github</a></b> !
        </p>
      </div>
      <div class="contact-page-form">
        <v-form ref="form" v-model="valid" :lazy-validation="false">
          <v-text-field
            rounded
            dense
            filled
            v-model="name"
            :counter="50"
            :rules="nameRules"
            label="Name"
            required
          ></v-text-field>
          <v-text-field
            rounded
            dense
            filled
            v-model="subject"
            :counter="50"
            :rules="subjectRules"
            label="Subject"
            required
          ></v-text-field>
          <v-text-field
            rounded
            dense
            filled
            v-model="email"
            :counter="50"
            :rules="emailRules"
            label="Email"
            required
          ></v-text-field>
          <v-textarea
            rounded
            dense
            filled
            v-model="message"
            :counter="1000"
            :rules="messageRules"
            label="Message"
            required
            class="message-area"
          ></v-textarea>
        </v-form>
      </div>
      <div class="button-container">
        <v-btn color="info" class="mr-4" @click="submitMessage">Submit</v-btn>
      </div>
      <v-snackbar v-model="snackbar">
        {{ toastMessage }}
        <template v-slot:action="{ attrs }">
          <v-btn color="pink" text v-bind="attrs" @click="snackbar = false">
            Close
          </v-btn>
        </template>
      </v-snackbar>
    </v-container>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import AuthButton from "../components/AuthButton.vue";
import UWPathIcon from "../components/UWPathIcon";
export default {
  name: "CourseSelection",
  components: {
    UWPathIcon,
    AuthButton
  },
  data() {
    return {
      snackbar: false,
      toastMessage: "",
      valid: true,
      name: "",
      nameRules: [v => !!v || "Name is required"],
      message: "",
      messageRules: [v => !!v || "Message is required"],
      email: "",
      emailRules: [
        v => !!v || "E-mail is required",
        v => /.+@.+\..+/.test(v) || "E-mail must be valid"
      ],
      subject: "",
      subjectRules: [v => !!v || "Subject is required"]
    };
  },
  methods: {
    ...mapActions(["sendEmail"]),
    goToCourseSelectionPage() {
      this.$router.push("/CourseSelection");
    },
    goToAboutUsPage() {
      this.$router.push("/About");
    },
    submitMessage() {
      if (this.$refs.form.validate()) {
        var emailInfo = {
          name: this.name,
          subject: this.subject,
          email: this.email,
          message: this.message
        };
        this.sendEmail(emailInfo).then(response => {
          if (!response) {
            this.toastMessage = "An error has occured. Please try again!";
          } else {
            this.toastMessage = "Email has successfuly sent!";
            this.$refs.form.reset();
          }
          this.snackbar = true;
        });
      }
    },
    goToHome() {
      this.$router.push("/");
    }
  }
};
</script>

<style scoped>
@import "../style.css";

.contact-page-container {
  overflow-y: auto;
}

.contact-page-title {
  padding-top: 2em;
  padding-left: 2em;
  text-align: left;
}

.contact-page-form {
  width: 94%;
  padding-top: 1em;
  margin-bottom: 2em;
}

.contact-page-info {
  width: 100%;
  text-align: left;
  padding-top: 1em;
}

.button-container {
  display: block !important;
  width: 100%;
  text-align: left;
}

.header {
  text-align: left;
  margin-top: 1rem;
  margin-bottom: 1rem;
}

.message-area {
  margin-bottom: 0;
}

.link {
  cursor: pointer;
}

.logo {
  margin-top: 0.2em;
  margin-right: 0.5em;
}
</style>
