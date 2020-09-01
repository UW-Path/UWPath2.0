var REQUIREMENT_ID = 10000

export const YEAR_TO_REQ_SECTION_MAP = {
    "-1": "others",
    "1": "firstYear",
    "2": "secondYear",
    "3": "thirdYear",
    "4": "fourthYear",
    "5": "one", 
    "6": "two",
    "7": "three",
    "8": "four",
    "9": "oneA",
    "10": "oneB",
    "11": "twoA",
    "12": "twoB",
    "13": "threeA",
    "14": "threeB",
    "15": "fourA",
    "16": "fourB",
};

/**
 * One course requirement, may contain information of multiple courses
 */
export class CourseRequirement {
    constructor(data) {
        this.number_of_courses = data && data.number_of_courses? data.number_of_courses : 0
        this.course_choices = data && data.course_choices ? data.course_choices : []        
        this.course_codes = this.course_choices.map(choice => {
            return choice.course_code
        })
        this.course_codes_raw = data && data.course_codes ? data.course_codes : ""
        if (data && data.course_choices && data.course_choices.length == 1) this.selected_course = data.course_choices[0]
        else if (data && data.selected_course) this.selected_course = data.selected_course 
        else this.selected_course = {course_code: "WAITING", course_number: 42}

        this.major = data && data.major ? data.major : []
        this.minor = data && data.minor ? data.minor : []
        this.specialization = data && data.specialization ? data.specialization : []
        this.overridden = data && data.overridden ? data.overridden : false
        this.id = data && data.id ? data.id : REQUIREMENT_ID++
        this.inRequirementBar = data && data.inRequirementBar ?  data.inRequirementBar  : true
        this.prereqs_met = data && data.prereqs_met ? data.prereqs_met : false
        this.additional_requirements = data && data.additional_requirements ? data.additional_requirements : []
        this.number_of_prereqs_met = data && data.number_of_prereqs_met ? data.number_of_prereqs_met : 0
        this.user_selected = data && data.user_selected ? data.user_selected : false
        // the year is x if all course choices that are in the requirement are in the same year, otherwise, it is -1 which is other
        // if additional req indicate when the course should be taken, this takes precedence
        this.section = data && data.section ? data.section : null

        if (data.additional_requirements === "1") this.year = 5
        else if (data.additional_requirements === "2") this.year = 6
        else if (data.additional_requirements === "3") this.year = 7
        else if (data.additional_requirements === "4") this.year = 8
        else if (data.additional_requirements === "1A") this.year = 9
        else if (data.additional_requirements === "1B") this.year = 10
        else if (data.additional_requirements === "2A") this.year = 11
        else if (data.additional_requirements === "2B") this.year = 12
        else if (data.additional_requirements === "3A") this.year = 13
        else if (data.additional_requirements === "3B") this.year = 14
        else if (data.additional_requirements === "4A") this.year = 15
        else if (data.additional_requirements === "4B") this.year = 16
        else{
            this.year = this.course_choices.length ? this.course_choices[0].year : -1
            for(let course of this.course_choices) if (course.year != this.year) this.year = -1
        }
    }

    deselect() {
        if (this.course_choices.length == 1) return
        this.selected_course = {course_code: "WAITING", course_number: 42}
    }

    isSelected() {
        return this.selected_course.course_code != "WAITING"
    }

    toggleOverride() {
        this.overridden = !this.overridden;
    }

    satisfied() {
        return false
    }

    split() {
        let copy = new CourseRequirement({...this})
        copy.number_of_courses = 1 
        this.number_of_courses -= 1 
        this.deselect()
        return copy
    }
}