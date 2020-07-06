
var requirementId = 0
/**
 * Information about one course
 */
export class CourseInfo {
    constructor(data) {
        // console.log("data", data)
        this.antireqs = data && data.antireqs ? data.antireqs.split(",") : []
        this.coreqs = data && data.coreqs ? data.coreqs.split(","): []
        this.course_abbr = data && data.course_abbr ? data.course_abbr : ""
        this.course_code = data && data.course_code ? data.course_code : ""
        this.course_id = data && data.course_id ? Number(data.course_id): -1
        this.course_name = data && data.course_name ? data.course_name: ""
        this.course_number = data && data.course_number ? Number(data.course_number) : -1
        this.credit = data && data.credit ? Number(data.credit) : -1
        this.info = data && data.info ? data.info : ""
        this.offering = data && data.offering ? data.offering.split(",") : []
        this.online = data && data.online ? data.online : true
        this.prereqs = data && data.prereqs ? data.prereqs.split(",") : []
        this.selected = data && data.selected ? data.selected : false
    }
}

/**
 * One course requirement, may contan multiple course informations 
 */
export class CourseRequirement {
    constructor(data) {
        this.number_of_courses = data && data.number_of_courses? data.number_of_courses : 0
        this.course_choices = data && data.course_choices ? data.course_choices : []
        this.course_codes = data && data.course_codes ? data.course_codes.split(",") : []
        //if there only exist one course in the requirement, then it is not a choice anymore
        this.selected_course = data && data.course_choices.length == 1? data.course_choices[0] : undefined
        
        //the majors or minors that this requirement is part of
        this.major = data && data.major ? data.major : []
        this.minor = data && data.minor ? data.minor : []
        this.specialization = data && data.specialization ? data.specialization : []
        this.overriden = false
        this.id = requirementId++
    }
}

export class Term {
    constructor (data) {
        void data 
        // WIP
    }
}