import firebase from "firebase/app";
import "firebase/firestore";

const state = {
  displayName: "",
  user: null
};

const getters = {
  isSignedIn: state => state.displayName !== "" && state.user !== null,
  getUser: state => state.user,
  getDisplayName: state => state.displayName
};

const actions = {
  updateFirestore({ state, rootState }) {
    if (state.displayName === "" || state.user === null) return;
    const userRef = firebase
      .firestore()
      .collection("users")
      .doc(state.user.uid);
    userRef.set({
      lastUpdated: new Date(),
      courseSelectionJSON: JSON.stringify({
        table: rootState.courseSelection.table,
        checklistMajorRequirements:
          rootState.courseSelection.checklistMajorRequirements,
        checklistMinorRequirements:
          rootState.courseSelection.checklistMinorRequirements,
        checklistOptionRequirements:
          rootState.courseSelection.checklistOptionRequirements
      }),
      coursesJSON: JSON.stringify({
        majorRequirements: rootState.courses.majorRequirements,
        minorRequirements: rootState.courses.minorRequirements,
        specRequirements: rootState.courses.specRequirements
      })
    });
  }
};

const mutations = {
  setUser(state, user) {
    state.displayName = user.displayName;
    state.user = user;
  },
  clearUser(state) {
    state.displayName = "";
    state.user = null;
  }
};

export default {
  state,
  actions,
  mutations,
  getters
};
