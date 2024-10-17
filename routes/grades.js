import { query, Router } from "express";
import db from "../db/conn.js";
import { ObjectId } from "mongodb";

const router = new Router();

router.get("/", async (req, res) => {
  try {
    // select the collection to use
    const gradesCollection = await db.collection("grades");
    // query the collection
    const grades = await gradesCollection.find().limit(10).toArray();
    // sending the back the json data
    res.json({ grades });
  } catch (e) {
    console.log(e);
  }
});

/**
 * GET /id
 * @description Return a grade document by id
 */
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  // select the collection to use
  const gradesCollection = await db.collection("grades");

  // query the collection
  const grade = await gradesCollection.findOne({
    _id: ObjectId.createFromHexString(id),
  });

  // if grade not found
  if (!grade) {
    res.status(404).json({ error: `Grade with id: ${id} Not Found` });
  } else {
    // sending back the json data
    res.json({ grade });
  }
});


router.get("/student_id/:id", async (req, res) => {
  const { id } = req.params;

  // select the collection to use
  const gradesCollection = await db.collection("grades");

  // Keep student_id for the query
  const studentGrades = await gradesCollection
    .find({
      learner_id: Number(id),
    })
    .toArray();

  res.json({ studentGrades });
});

/**
 * GET /class/:id
 */
router.get("/class/id", async (req, res) => {
  const { id } = req.params;

  // select the collection to use
  const gradesCollection = await db.collection("grades");

  const gradesByClassId = await gradesCollection
    .find({
      class_id: Number(id),
    })
    .toArray();

  if (!gradesByClassId) {
    res.status(404).json({ error: `Class id ${id} Not Found` });
  } else {
    res.json({ grades: gradesByClassId });
  }
});

/**
 * Create a single grade entry
 */
router.post("/", async (req, res) => {
  let collection = await db.collection("grades");
  let newDocument = req.body;

  // rename fields for backwards compatibility
  if (newDocument.student_id) {
    newDocument.learner_id = newDocument.student_id;
    delete newDocument.student_id;
  }

  let result = await collection.insertOne(newDocument);
  res.send(result).status(204);
});

/**
 * Add a score to the grade entry
 */

router.patch("/:id/add", async (req, res) => {
    let collection = await db.collection("grades");
    let query = {_id: req.params.id};

    let result = await collection.updateOne(query, {
        $pull: {scores: req.body},
    })

    if(!result) res.send("Not Found").status(404);
    else res.send(result).status(200);
})

/**
 * Remove a score from a grade entry
 */
router.patch("/:id/remove", async (req, res) => {
    let collection = await db.collection("grades");
    let query = {_id: new ObjectId(req.params.id)};

    let result = await collection.updateOne(query, {
        $pull: {scores: req.body},
    });

    if(!result) res.send("Not Found").status(404);
    else res.send(result).status(200);
})

/**
 * Delete a single grade entry
 */
router.delete("/:id", async (req, res) => {
    let collection = await db.collection("grades");
    let query = {_id: new ObjectId(req.params.id)};
    let result = await collection.deleteOne(query);

    if(!result) res.send("Not Found").status(404);
    else res.send(result).status(200);
})


export default router;
