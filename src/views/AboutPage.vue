<template>
  <div style="background-color:ghostwhite; overflow-y: auto;">
    <v-app-bar
      style="background: linear-gradient(38.92deg, #8198AB 36.61%, #2B435D 102.9%), #4A75AD;"
    >
      <router-link to="/">
        <span class="logo"><UWPathIcon /></span>
      </router-link>
      <v-toolbar-title class="uwpath-title">
        UWPath
      </v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn text color="white" v-on:click="goToCourseSelectionPage">
        Plan Courses
      </v-btn>
      <v-btn text color="white" v-on:click="goToContactPage"> Contact</v-btn>
      <auth-button />
    </v-app-bar>
    <div class="about">
      <div class="container-background"></div>
      <div class="container">
        <br />
        <h1>Our Story</h1>
        <br />
        <p class="mission-text" data-aos="fade" data-aos-duration="2500">
          UWPath started with a bold idea. Every term, students have to plan out
          their courses in order to make sure they graduate with all their
          major, minor and specialization requirements. What if there's a
          website that allows you to plan your degree accordingly - just like
          how you plan your class schedule every term? And voila, that's how
          UWPath started! The project started with two friends who met on their
          first co-op and the team has grown into 5 people since then!
        </p>
      </div>
      <div class="our-team" data-aos="fade-up" data-aos-duration="1000">
        <h1 style="text-align:left">Welcome to UWPath</h1>
        <div class="row">
          <div class="col" style="text-align:left">
            UWPath is a degree planning website built for UWaterloo students.
            You can plan your courses in our degree planner, where we verify
            prerequisites, corequisites, antirequisites and degree fulfillment
            on your behalf.
            <br /><br />
            Want to take a specific degree with a minor and a specialization? We
            provide automated software that shows you what courses you need to
            take for each part of your degree. See our checklist to verify you
            meet the degree requirements.
          </div>
        </div>

        <br />
        <h1 style="text-align:left">Meet the Team</h1>
        <br />
        <div class="row">
          <div class="col">
            <v-avatar size="200">
              <img src="../assets/hao-wei.png" alt="Hao Wei" />
            </v-avatar>
          </div>
          <div class="col-12 col-lg-9" style="text-align:left">
            <h3>Co-Founder - Hao Wei Huang</h3>
            <a href="https://www.linkedin.com/in/haoweihuang/" target="_blank"
              >Linkedin</a
            >
            |
            <a href="https://haowei99.github.io/Portfolio/" target="_blank"
              >Website</a
            >
            <p>
              <br />
              Hao Wei never thought he would be a programmer. He started as a
              Math/Business student but found a passion in programming over the
              years at UW. He is extremely grateful to have such a talented team
              to bring his vision of UWPath to life!
              <br /><br />
              You can find Hao Wei playing basketball at CIF (pre-covid),
              traveling around the world, and watching movies in his free time.
            </p>
          </div>
        </div>
        <div class="row">
          <div class="col">
            <v-avatar size="200">
              <img src="../assets/calder.png" alt="Calder" />
            </v-avatar>
          </div>
          <div class="col-12 col-lg-9" style="text-align:left">
            <h3>Co-Founder - Calder Lund</h3>
            <a href="https://github.com/CalderLund" target="_blank">GitHub</a> |
            <a
              href="https://www.linkedin.com/in/calder-lund-874381156/"
              target="_blank"
              >Linkedin</a
            >
            |
            <a
              href="https://www.youtube.com/user/TheBurntLemons"
              target="_blank"
              >YouTube</a
            >
            <p>
              <br />
              Calder is a former pro hockey player turned musician turned film
              creator turned computer scientist. He currently specializes in
              Infrastructure Engineering, but has worked on a variety of
              projects that include machine learning, website design, software
              security, computer networks and much more.
              <br /><br />
              Outside of school, Calder spends most of his time playing
              basketball, writing music or improving his slightly above mediocre
              chess skills.
            </p>
          </div>
        </div>
        <div class="row">
          <div class="col">
            <v-avatar color="grey" size="200">
              <img src="../assets/kevinf.jpeg" alt="Kevin" />
            </v-avatar>
          </div>
          <div class="col-12 col-lg-9" style="text-align:left">
            <h3>Front-End Developer - Kevin Feng</h3>
            <a
              href="https://www.linkedin.com/in/wen-liang-feng/"
              target="_blank"
              >Linkedin</a
            >
            | <a href="https://kevinfwl.com/" target="_blank">Website</a> |
            <a href="https://www.strava.com/athletes/57015798" target="_blank"
              >Strava</a
            >
            <p>
              Kevin is a 3rd year student computer science student currently
              pursuing a minor in combinatorics and optimization. His main area
              of interest is in software security, but has experience in full
              stack development, distributed systems and blockchain.
              <br /><br />
              Outside of classes, Kevin is an avid badminton player, mid
              distance runner and biker. Feel free to check out his Strava!
            </p>
          </div>
        </div>
        <div class="row">
          <div class="col">
            <v-avatar color="grey" size="200">
              <img src="../assets/adrian.jpg" alt="Adrian" />
            </v-avatar>
          </div>
          <div class="col-12 col-lg-9" style="text-align:left">
            <h3>Front-End Developer - Adrian Pasqualini</h3>
            <a
              href="https://www.linkedin.com/in/adrian-pasqualini-2b7071187/"
              target="_blank"
              >Linkedin</a
            >
            | <a href="http://adrianpasqualini.com" target="_blank">Website</a>
            <p>
              Adrian is currently in his 3rd year at Waterloo. As a computer
              science student working towards several minors and options (CO
              minor and AI option), Adrian found it strange that there was no
              tool to help manage your schedule and meet all the different
              requirements. After experimenting with several ideas on his own,
              Adrian joined UWPath to help bring their plan to life.
              <br /><br />
              Adrian has also been spotted running around campus hunting for
              zombies in his free time.
            </p>
          </div>
        </div>

        <br />
        <h1 style="text-align:left">Privacy</h1>
        <div class="row">
          <div class="col-12" style="text-align:left">
            <p>
              UWPath takes user privacy seriously. We do not store any personal
              data regarding course plans nor any other sensitive information
              about our users. In order to enhance the user experience, we store
              a small amount data on your local machine. This helps your
              computer remember your course plan every time you revisit UWPath.
              If you would like to remove local storage, simply prompt
              <i
                >Developer Tools by pressing F12 -> Navigate to Application tab
                -> Click on Clear Site Data under Clear Storage</i
              >. We also use Google Analytics to track the traffic of the
              website anonymously in order to improve our website. <br /><br />
              Please do not hesitate to <a href="/Contact">contact us</a> with
              any concerns.
            </p>
          </div>
        </div>
        <br />
        <h1 style="text-align:left">Sponsorship</h1>
        <div class="row">
          <div class="col-12" style="text-align:left">
            <img src="../assets/MEF_logo.png" alt="MEF" />
            <p>
              UWPath is proudly sponsored by University of Waterloo's Math
              Endowment Fund (<a
                href="https://uwaterloo.ca/math-endowment-fund/"
                target="_blank"
                >MEF)</a
              >
            </p>
          </div>
        </div>
        <br />
      </div>
    </div>
  </div>
</template>

<script>
import AuthButton from "../components/AuthButton.vue";
import UWPathIcon from "../components/UWPathIcon";
export default {
  name: "CourseSelection",
  components: {
    UWPathIcon,
    AuthButton
  },
  methods: {
    goToCourseSelectionPage() {
      this.$router.push("/CourseSelection");
    },
    goToContactPage() {
      this.$router.push("/Contact");
    },
    goToHome() {
      this.$router.push("/");
    }
  }
};
</script>
<style>
@import "../style.css";
.logo {
  margin-top: 0.2em;
  margin-right: 0.5em;
}

.about {
  position: relative;
}

.about .container-background {
  position: absolute;
  height: 48vh;
  width: 100%;
  background-image: url("../assets/coverBird.png");
  background-size: cover;
  opacity: 0.5;
}
.about .container {
  height: 48vh;
  position: relative;
  z-index: 1;
}

.mission-text {
  padding-right: 10em;
  padding-left: 10em;
}

.our-team {
  margin-top: 2em;
  padding-right: 10em;
  padding-left: 10em;
}
</style>
