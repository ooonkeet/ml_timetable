import Subject from '../../models/admin/subjects.model.js';
import Activity from "../../models/admin/activity.model.js"; // Import Activity model
import axios from 'axios';

//POST
export const createSubject = async (req, res) => {
  try {
    const subject = new Subject(req.body);
    await subject.save();

    const populatedSubject = await Subject.findById(subject._id).populate({
      path: 'stream',
      populate: {
        path: 'program',
        select: 'name'
      },
      select: 'name'
    });

    // Log activity
    await Activity.create({
      action: "Created",
      entity: "Subject",
      details: `Subject '${populatedSubject.name}' (${populatedSubject.code}, ${populatedSubject.type}) was added to Stream '${populatedSubject.stream.name}' (${populatedSubject.stream.program.name}).`,
    });

    res.status(201).json(subject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//GET
export const getSubjects = async (req, res) => {
  try {
    let query = {};
    if (req.query.streamId) {
      query.stream = req.query.streamId;
    }
    if (req.query.year) {
      query.year = Number(req.query.year);
    }
    if (req.query.semester) {
      query.semester = Number(req.query.semester);
    }
    const subjects = await Subject.find(query).populate('stream');
    res.status(200).json(subjects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id);
    res.status(200).json(subject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//UPDATE
export const updateSubject = async (req, res) => {
  try {
    const newSubject = await Subject.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate({
      path: 'stream',
      populate: {
        path: 'program',
        select: 'name'
      },
      select: 'name'
    });

    if (!newSubject) return res.status(404).json({ message: "Subject not found" });

    // Log activity
    await Activity.create({
      action: "Updated",
      entity: "Subject",
      details: `Subject '${newSubject.name}' (${newSubject.code}, ${newSubject.type}) in Stream '${newSubject.stream.name}' (${newSubject.stream.program.name}) was updated.`,
    });

    res.status(200).json(newSubject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//DELETE
export const deleteSubject = async (req, res) => {
  try {
    const subjectToDelete = await Subject.findById(req.params.id).populate({
      path: 'stream',
      populate: {
        path: 'program',
        select: 'name'
      },
      select: 'name'
    });
    if (!subjectToDelete) return res.status(404).json({ message: "Subject not found" });

    await Subject.findByIdAndDelete(req.params.id);

    // Log activity
    await Activity.create({
      action: "Deleted",
      entity: "Subject",
      details: `Subject '${subjectToDelete.name}' (${subjectToDelete.code}) from Stream '${subjectToDelete.stream.name}' was deleted.`,
    });

    res.json({ message: "Subject deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// BULK CREATE
export const createSubjectsBulk = async (req, res) => {
  try {
    const { subjects } = req.body;
    if (!Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({ message: "Subjects array is required" });
    }
    const createdSubjects = await Subject.insertMany(subjects);
    
    // Log activity
    await Activity.create({
      action: "Created",
      entity: "Subject",
      details: `Bulk created ${createdSubjects.length} subjects.`,
    });

    res.status(201).json(createdSubjects);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Helper to parse Markdown tables extracted from PDFs
const parseMarkdownTable = (markdownText) => {
  const lines = markdownText.split("\n");
  let codeIdx = -1;
  let nameIdx = -1;
  let creditsIdx = -1;
  let lIdx = -1;
  let tIdx = -1;
  let pIdx = -1;
  
  const subjects = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("|")) continue;
    
    // Split by | and trim each cell
    const cells = trimmed.split("|").map(c => c.trim());
    
    // Look for headers to map indices dynamically
    const isHeaderRow = cells.some(cell => {
      const lower = cell.toLowerCase();
      return lower.includes("code") || lower.includes("title") || lower.includes("subject name") || lower.includes("credits");
    });
    
    if (isHeaderRow) {
      for (let i = 0; i < cells.length; i++) {
        const lower = cells[i].toLowerCase();
        if (lower === "code" || lower.includes("course code") || lower.includes("subject code") || lower.includes("sub. code")) {
          codeIdx = i;
        } else if (lower.includes("title") || lower === "name" || lower.includes("subject name") || lower.includes("course name")) {
          nameIdx = i;
        } else if (lower === "credits" || lower === "credit" || lower === "cr." || lower.includes("credits")) {
          creditsIdx = i;
        } else if (lower === "l" || lower === "lecture" || lower === "lectures") {
          lIdx = i;
        } else if (lower === "t" || lower === "tutorial" || lower === "tutorials") {
          tIdx = i;
        } else if (lower === "p" || lower === "practical" || lower === "practicals" || lower === "lab") {
          pIdx = i;
        }
      }
      continue;
    }
    
    // Skip separator lines like | --- | --- |
    if (trimmed.includes("---")) continue;
    
    // Extract values based on mapped indices
    if (codeIdx !== -1 && nameIdx !== -1 && cells[codeIdx]) {
      const code = cells[codeIdx];
      const name = cells[nameIdx];
      
      // Skip header duplicates or invalid rows
      if (!code || code.toLowerCase().includes("code") || code.includes("-") || code.length > 15 || code.length < 2) {
        continue;
      }
      
      const creditsVal = creditsIdx !== -1 ? parseFloat(cells[creditsIdx]) : 0;
      const credits = isNaN(creditsVal) ? 0 : creditsVal;
      
      // Determine type
      let type = "theory";
      const codeLower = code.toLowerCase();
      const nameLower = name.toLowerCase();
      if (
        codeLower.includes("lab") || 
        codeLower.includes("prac") ||
        nameLower.includes("lab") || 
        nameLower.includes("practical") || 
        nameLower.includes("workshop") ||
        nameLower.includes("seminar") ||
        (pIdx !== -1 && parseFloat(cells[pIdx]) > 0)
      ) {
        type = "lab";
      }
      
      // Determine totalClassesPerWeek
      let totalClassesPerWeek = 0;
      if (type === "lab") {
        const pVal = pIdx !== -1 ? parseInt(cells[pIdx], 10) : 0;
        totalClassesPerWeek = !isNaN(pVal) && pVal > 0 ? pVal : Math.ceil(credits * 2);
      } else {
        const lVal = lIdx !== -1 ? parseInt(cells[lIdx], 10) : 0;
        const tVal = tIdx !== -1 ? parseInt(cells[tIdx], 10) : 0;
        const lHours = !isNaN(lVal) ? lVal : 0;
        const tHours = !isNaN(tVal) ? tVal : 0;
        totalClassesPerWeek = lHours + tHours;
        if (totalClassesPerWeek === 0) {
          totalClassesPerWeek = Math.ceil(credits);
        }
      }
      
      subjects.push({
        code,
        name,
        type,
        credits,
        totalClassesPerWeek: Math.min(totalClassesPerWeek, 10)
      });
    }
  }
  return subjects;
};

// PARSE SYLLABUS
export const parseSyllabusController = async (req, res) => {
  try {
    const { fileData, mimeType } = req.body;
    if (!fileData || !mimeType) {
      return res.status(400).json({ message: "fileData (base64) and mimeType are required" });
    }

    const apiKey = process.env.OPENROUTER_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({
        message: "OpenRouter API key is not configured in backend .env file.",
        setupInstruction: "Please add OPENROUTER_API_KEY=your_key in backend/.env file. You can obtain a free API key from OpenRouter (https://openrouter.ai/)."
      });
    }

    // Diagnostic log (obfuscated key)
    const maskedKey = apiKey.substring(0, 8) + "..." + (apiKey.length > 12 ? apiKey.substring(apiKey.length - 4) : "");
    console.log(`[OpenRouter Diagnostics] Loaded API Key: ${maskedKey} (Length: ${apiKey.length})`);

    // Strip out the data URI prefix if it exists
    const base64Data = fileData.includes(";base64,")
      ? fileData.split(";base64,")[1]
      : fileData;

    // Prepare content parts for OpenRouter
    let fileContent;
    if (mimeType.startsWith("image/")) {
      fileContent = {
        type: "image_url",
        image_url: {
          url: `data:${mimeType};base64,${base64Data}`
        }
      };
    } else {
      fileContent = {
        type: "file",
        file: {
          filename: "syllabus.pdf",
          file_data: `data:${mimeType};base64,${base64Data}`
        }
      };
    }

    console.log("Calling OpenRouter API to parse syllabus...");
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openrouter/free",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Analyze the uploaded syllabus document. Find the courses/subjects table and extract all subjects into a structured array of JSON objects matching the schema. For each subject, extract:\n" +
                  "- code (string, alphanumeric, max 15 chars, e.g., 'IT101', 'IT191', 'ME101')\n" +
                  "- name (string, full course name)\n" +
                  "- type (string, must be either 'theory' or 'lab')\n" +
                  "- credits (number, e.g. 3, 2, 1.5)\n" +
                  "- totalClassesPerWeek (integer representing classes per week: for theory subjects, this is equal to Lectures+Tutorials hours; for lab subjects, this is equal to Practical/Lab hours. Max value is 10).\n\n" +
                  "You must respond with a valid JSON object containing a single key 'subjects' which contains an array of the extracted subjects. Example:\n" +
                  "{\n" +
                  "  \"subjects\": [\n" +
                  "    { \"code\": \"IT101\", \"name\": \"Mathematics\", \"type\": \"theory\", \"credits\": 3, \"totalClassesPerWeek\": 3 }\n" +
                  "  ]\n" +
                  "}"
              },
              fileContent
            ]
          }
        ],
        response_format: {
          type: "json_object"
        }
      },
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "HTTP-Referer": "http://localhost:5173",
          "X-Title": "Schedura"
        }
      }
    );

    const resultText = response.data?.choices?.[0]?.message?.content;
    if (!resultText) {
      return res.status(500).json({ message: "Invalid or empty response from OpenRouter API" });
    }

    const parsedData = JSON.parse(resultText);
    res.status(200).json(parsedData);
  } catch (error) {
    console.error("OpenRouter API Error:", error.message);
    if (error.response?.data) {
      console.error("OpenRouter API Details:", JSON.stringify(error.response.data, null, 2));
    }

    // Fallback: If OpenRouter failed (e.g. rate limit 429) but already parsed the PDF text into markdown table metadata
    try {
      const fileAnnotations = error.response?.data?.error?.metadata?.file_annotations;
      if (fileAnnotations && Array.isArray(fileAnnotations)) {
        console.log("[Fallback Parser] Detected file annotations in error metadata. Attempting to parse markdown table locally...");
        for (const ann of fileAnnotations) {
          const content = ann?.file?.content;
          if (content && Array.isArray(content)) {
            for (const item of content) {
              if (item.type === "text" && item.text.includes("|")) {
                const subjects = parseMarkdownTable(item.text);
                if (subjects && subjects.length > 0) {
                  console.log(`[Fallback Parser] Success! Locally extracted ${subjects.length} subjects from OpenRouter pre-parsed markdown table.`);
                  return res.status(200).json({ subjects });
                }
              }
            }
          }
        }
      }
    } catch (fallbackErr) {
      console.error("[Fallback Parser] Error during local parsing fallback:", fallbackErr.message);
    }
    
    const detailedMessage = error.response?.data?.error?.message || error.message;
    res.status(500).json({
      message: `OpenRouter API Error: ${detailedMessage}`,
      error: error.message,
      details: error.response?.data
    });
  }
};
