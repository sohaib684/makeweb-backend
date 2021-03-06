const express = require("express");
const mongoose = require('mongoose');
const Joi = require("@hapi/joi");
const _ = require("lodash");

const userAuth = require("../middleware/userAuth");
const { Project } = require("../models/project");

const router = express.Router();

function validateNewProject(body) {
    const postSchema = Joi.object({
        name: Joi.string().required().label("Project Name"),
        isInitiated: Joi.boolean()
            .required()
            .label("Project Started ? [True / False]"),
        link: Joi.string().when('isInitiated', {
            is: false,
            then: Joi.forbidden(),
            otherwise: Joi.required()
        }).label("Project Link"),
        stacks: Joi.string().required().label("Stacks in use"),
        fieldOfStudy: Joi.string().required().label("Field of Study"),
        lookingFor: Joi.string()
            .required()
            .valid("mentor", "student", "both")
            .label("Looking For"),
        idea: Joi.string().required().label("Project Idea"),
    });

    return postSchema.validate(body);
}

router.get('/', userAuth, async(req, res) => {
    const projects = await Project.find({userId: req.user._id});
    res.send(projects);
})

router.get('/:projectId', userAuth, async(req, res) => {
    if (!mongoose.Types.ObjectId.isValid(req.params.projectId))
        return res.status(400).send(`${req.params.projectId} is not a valid ID`);

    const project = await Project.findById(req.params.projectId);

    if (!project) return res.status(400).send(`ID ${req.params.projectId} is not associated with any project`);
    res.send(project);
})

router.post("/new", userAuth, async (req, res) => {
    const { error } = validateNewProject(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const project = new Project(
        _.pick(req.body, [
            "name",
            "isInitiated",
            "link",
            "stacks",
            "fieldOfStudy",
            "lookingFor",
            "idea",
        ])
    );
    project.userId = req.user._id;

    await project.save();
    return res.status(201).send(project._id);
    
});

module.exports = router;
