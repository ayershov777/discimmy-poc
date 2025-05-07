const axios = require('axios');

class GeminiService {
    constructor() {
        this.apiKey = process.env.GEMINI_API_KEY;
        this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
        // this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-exp-03-25:generateContent';
    }

    async generateContent(prompt) {
        try {
            const response = await axios.post(
                `${this.baseUrl}?key=${this.apiKey}`,
                {
                    contents: [
                        {
                            parts: [
                                { text: prompt }
                            ]
                        }
                    ],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 8192
                    }
                }
            );

            // Extract and return the generated text
            if (response.data.candidates &&
                response.data.candidates[0] &&
                response.data.candidates[0].content &&
                response.data.candidates[0].content.parts &&
                response.data.candidates[0].content.parts[0]) {
                return response.data.candidates[0].content.parts[0].text;
            }

            throw new Error('Unexpected response format from Gemini API');
        } catch (error) {
            console.error('Error calling Gemini API:', error.message);
            if (error.response) {
                console.error('Response data:', error.response.data);
                console.error('Response status:', error.response.status);
            }
            throw error;
        }
    }

    // Generate/enhance pathway title
    async generatePathwayTitle(pathway) {
        const prompt = `
        Create a concise, engaging title for a learning pathway with the following details:

        ${pathway.description ? `Description: ${pathway.description}` : ''}
        ${pathway.goal ? `Goal: ${pathway.goal}` : ''}
        ${pathway.requirements ? `Requirements: ${pathway.requirements}` : ''}
        ${pathway.targetAudience ? `Target Audience: ${pathway.targetAudience}` : ''}
        
        Respond with only the title, no additional explanation.
        `;

        console.log('Pathway title prompt:', prompt);

        return this.generateContent(prompt);
    }

    // Generate/enhance pathway description
    async generatePathwayDescription(pathway) {
        const prompt = `
        Create an attractive description for a learning pathway with the following details:
        
        ${pathway.title ? `Title: ${pathway.title}` : ''}
        ${pathway.goal ? `Goal: ${pathway.goal}` : ''}
        ${pathway.requirements ? `Requirements: ${pathway.requirements}` : ''}
        ${pathway.targetAudience ? `Target Audience: ${pathway.targetAudience}` : ''}
        
        The description should be a brief paragraph explaining what learners will achieve
        and why this pathway is valuable. Use markdown format.
        
        Respond with only the description, no additional explanation.
        `;

        console.log('Pathway description prompt:', prompt);

        return this.generateContent(prompt);
    }

    // Generate/enhance pathway goal
    async generatePathwayGoal(pathway) {
        const prompt = `
        Create a clear goal statement for a learning pathway with the following details:
        
        ${pathway.title ? `Title: ${pathway.title}` : ''}
        ${pathway.description ? `Description: ${pathway.description}` : ''}
        ${pathway.requirements ? `Requirements: ${pathway.requirements}` : ''}
        ${pathway.targetAudience ? `Target Audience: ${pathway.targetAudience}` : ''}
        
        The goal should be 1 sentence clearly defining what learners will be able to do
        after completing the pathway. Use markdown format.
        
        Respond with only the goal statement, no additional explanation. Start with the word "To".
        `;

        return this.generateContent(prompt);
    }

    // Generate/enhance pathway requirements
    async generatePathwayRequirements(pathway) {
        const prompt = `
        Create a list of prerequisites or requirements for a learning pathway with the following details:
        
        ${pathway.title ? `Title: ${pathway.title}` : ''}
        ${pathway.description ? `Description: ${pathway.description}` : ''}
        ${pathway.goal ? `Goal: ${pathway.goal}` : ''}
        ${pathway.targetAudience ? `Target Audience: ${pathway.targetAudience}` : ''}
        
        The requirements should detail what knowledge, skills, or resources learners need before
        starting this pathway. Use markdown format with bullet points.
        
        Respond with only the requirements, no additional explanation.
        `;

        return this.generateContent(prompt);
    }

    // Generate/enhance pathway target audience
    async generatePathwayTargetAudience(pathway) {
        const prompt = `
        Describe the ideal target audience for a learning pathway with the following details:
        
        ${pathway.title ? `Title: ${pathway.title}` : ''}
        ${pathway.description ? `Description: ${pathway.description}` : ''}
        ${pathway.goal ? `Goal: ${pathway.goal}` : ''}
        ${pathway.requirements ? `Requirements: ${pathway.requirements}` : ''}
        
        The target audience description should be concise but specific about who would benefit most
        from this pathway.
        
        Respond with only the target audience description, no additional explanation.
        `;

        return this.generateContent(prompt);
    }

    // Generate/enhance module name
    async generateModuleName(module, pathway) {
        const prompt = `
        Create a concise, descriptive name for a learning module with the following details:
        
        Part of pathway: ${pathway.title || ''}
        Module description: ${module.description || ''}
        Module concepts: ${(module.concepts || []).join(', ')}
        
        The module name should be brief (under 50 characters) but clearly indicate what the module covers.
        
        Respond with only the module name, no additional explanation.
        `;

        return this.generateContent(prompt);
    }

    // Generate/enhance module description
    async generateModuleDescription(module, pathway) {
        const prompt = `
        Create a detailed description for a learning module with the following details:
        
        Module name: ${module.name || ''}
        Part of pathway: ${pathway.title || ''}
        Module concepts: ${(module.concepts || []).join(', ')}
        
        The description should explain what learners will achieve in this module and how it 
        fits into the overall pathway. Use markdown format.
        
        Respond with only the description, no additional explanation.
        `;

        return this.generateContent(prompt);
    }

    // Generate/enhance module concepts
    async generateModuleConcepts(module, pathway) {
        const prompt = `
        Generate a complete list of concepts that should be covered in a learning module with the following details:
        
        Module name: ${module.name || ''}
        Part of pathway: ${pathway.title || ''}
        Module description: ${module.description || ''}
        
        Each concept should be a few words to a short phrase.
        
        Respond with only a JSON array of strings, e.g., ["Concept 1", "Concept 2", ...].
        `;

        const response = await this.generateContent(prompt);
        try {
            return JSON.parse(response);
        } catch (e) {
            // If parsing fails, try to extract array from the text
            const match = response.match(/\[.*\]/s);
            if (match) {
                try {
                    return JSON.parse(match[0]);
                } catch (e2) {
                    console.error('Failed to parse concepts array:', e2);
                    throw new Error('Failed to parse concepts from Gemini response');
                }
            }
            console.error('Failed to extract concepts array:', e);
            throw new Error('Failed to parse concepts from Gemini response');
        }
    }

    // Generate module prerequisites (this is more complex as it needs to reference existing modules)
    async generateModulePrerequisites(module, pathway, availableModules) {
        const availableModulesText = availableModules
            .filter(m => m._id.toString() !== module._id?.toString())
            .map(m => `${m.name} (key: ${m.key}, concepts: ${(m.concepts || []).join(', ')})`)
            .join('\n');

        const prompt = `
        For a learning module named "${module.name || ''}" with the following details:
        
        Part of pathway: ${pathway.title || ''}
        Module description: ${module.description || ''}
        Module concepts: ${(module.concepts || []).join(', ')}
        
        Suggest prerequisites from the following available modules:
        ${availableModulesText}
        
        Consider logical learning progression. Return a nested array representing prerequisite groups.
        Modules within a group use AND logic (all must be completed), while different groups use OR logic 
        (any group completion is sufficient). If no prerequisites are needed, return an empty array.
        
        For example:
        - [[]] means no prerequisites
        - [["module-key-1", "module-key-2"]] means both module-key-1 AND module-key-2 are required
        - [["module-key-1"], ["module-key-2"]] means EITHER module-key-1 OR module-key-2 is required
        
        Respond with only a JSON array of arrays of string keys, e.g., [["key1", "key2"], ["key3"]].
        `;

        const response = await this.generateContent(prompt);
        try {
            return JSON.parse(response);
        } catch (e) {
            // If parsing fails, try to extract array from the text
            const match = response.match(/\[.*\]/s);
            if (match) {
                try {
                    return JSON.parse(match[0]);
                } catch (e2) {
                    console.error('Failed to parse prerequisites array:', e2);
                    throw new Error('Failed to parse prerequisites from Gemini response');
                }
            }
            console.error('Failed to extract prerequisites array:', e);
            throw new Error('Failed to parse prerequisites from Gemini response');
        }
    }

    // Generate module content
    async generateModuleContent(module, pathway) {
        const prereqsArray = module.prerequisites || [[]];
        const prereqsString = JSON.stringify(prereqsArray);

        const conceptsArray = module.concepts || [];
        const conceptsString = conceptsArray.map((concept, index) => `${index + 1}. ${concept}`).join('\n');

        const prompt = `
**Objective:** Create a structured learning module focused on ${module.name || 'this topic'}, designed for ${pathway.targetAudience || 'learners'}.

**Core Concepts to Cover:**
Organize the module around the following core concepts, provided in a logical sequence:
${conceptsString}

**Context within Learning Pathway:**
* **Prerequisite Knowledge:** Assumes completion of the following prerequisite modules and understanding of their associated concepts. Include a brief activation of prior knowledge related to these concepts in the Warmup segment(s).
    * Prerequisites: ${prereqsString}

* **Leads To:** This module serves as a prerequisite for future modules.

**Module Presentation Structure:**
* **Information Architecture:** Structure the module logically by concept using sequentially numbered sections. Use top-level headings (##) for major concepts or sections. Use lower-level headings (###, ####) for individual segments within those sections.
* **Segment Types:** Break the module content into distinct segments using the following types: article, research, exercise, session, project. Each segment should be structured as a separate object in the JSON array.

**Segment Content & Instructions:**

* **Warmup Segment(s):**
    * Start the module with one or more introductory segments designated for warmup.
    * Purpose: Activate relevant prior knowledge from the listed prerequisite concepts, establish context for the new module, and prime for new learning.
    * Components: Keep brief. Include relevance framing (why this topic matters), prior knowledge activation (e.g., self-assessment questions related to prerequisite concepts), and curiosity stimulation (e.g., engaging question/problem related to the module topic).
* **research Segments:**
    * Purpose: Introduce new concepts through guided investigation.
    * This is the primary segment for knowledge transfer and should be used for most of the module's content.
    * Provide specific questions or tasks for students to investigate related to the concept being introduced.
    * Provide direct hyperlinks to specific pages within reliable online resources that help answer the research questions. Ensure links are properly formatted in Markdown.
    * Clearly state the expected outcome (e.g., understanding required, notes to take, summary to write).
* **article Segments:**
    * Purpose: Introduce concepts or provide concise summaries/checkpoints.
    * Use for brief introductions to set the stage or as checkpoints after research/application segments to summarize key takeaways.
* **exercise Segments:**
    * Purpose: Allow learners to practice and apply concepts actively.
    * Provide practical, hands-on tasks relevant to the module's concepts, with clear instructions and expected outcomes.
    * Place these after relevant research/article segments and before any corresponding Learner Focus session.
    * **IMPORTANT:** Ensure instructions explicitly state that learners should use placeholder or fictional information where personal details might otherwise be requested. Avoid deliverables requiring users to expose personal information in general, even if it's fictional.
* **integration Segments:**
    * Purpose: Connect knowledge across different concepts within the module.
    * Include *at least two* distinct integration segments (e.g., exercises or mini-projects) of graduating complexity after several core concepts have been introduced and applied, but before the final consolidation section. These should require learners to synthesize multiple concepts or apply them in broader scenarios relevant to the module's domain.
* **session Segments (Peer Mentoring):**
    * **Learner Focus Sessions:**
        * **Placement:** Include Learner Focus session segments immediately after relevant application exercises throughout the module where feedback would be beneficial.
        * **Function:** Define concrete, actionable tasks driven by the Learner's needs for the specific concept or exercise review.
        * **Waiting Instruction:** Include clear instructions for the learner while waiting for a peer match.
    * **Mentor Focus Sessions:**
        * **Placement:** Generate these segments ONLY within the final Consolidation Section, *before* the project segment. Ensure the number matches the number of Learner Focus sessions.
        * **Function:** These sessions fulfill the reciprocal participation requirement. Each session focuses on a single, specific key concept.
    * **Project Presentation Sessions:**
        * **Placement:** Generate this segment once after the final project.
        * **Function:** This session focuses on the project segment. The student reviews their project with a peer, discusses challenges, and shares reflections on the project.
* **Consolidation Section:** Include a final major section dedicated to consolidation. This section should contain the Mentor Focus Sessions first, followed by the Project Segment, and then the final Project-related Learner Focus Session (if included).
* **project Segment:**
    * Purpose: Synthesize module concepts in a significant application task.
    * Include one final project segment. Make this section detailed and clearly structured for the learner.
    * Define core requirements for the final project artifact clearly.
    * **IMPORTANT:** Reiterate that placeholder or fictional information should be used instead of personal details.

**Output Format and JSON Escaping Requirements:**
* The structure should be an array of segment objects:
[
  {
    "type": "string", // one of: article, research, exercise, session, project, integration
    "title": "string", // the title of the segment
    "content": "string", // Markdown content of the segment (properly escaped for JSON)
    "section": "string" // optional: the section this segment belongs to (e.g., "Introduction", "Consolidation")
  }
]

**EXTREMELY IMPORTANT - JSON STRING ESCAPING:**
1. All special characters in the content field MUST be escaped properly for JSON strings:
   - Single quotes/apostrophes (') do NOT need escaping in JSON (just use them as-is)
   - Double quotes (") MUST be escaped with a backslash: \\"
   - Backslashes (\\) MUST be escaped: \\\\
   - Newlines MUST be escaped as: \\n
   - Tabs MUST be escaped as: \\t
   - Carriage returns MUST be escaped as: \\r

2. DO NOT include actual newlines within the content string - use \\n instead.
3. DO NOT include unescaped backslashes within the content string - use \\\\ instead.
4. ALWAYS double-check that your output is valid JSON by ensuring all quotes, backslashes, and newlines are properly escaped.

This is ABSOLUTELY CRITICAL for the module content to be processed correctly. Improper escaping will cause JSON parsing to fail and the entire content will be rejected.

Example of proper escaping:
"content": "## Main Title\\n\\nThis is a paragraph with \\"quoted text\\" and apostrophes don't need escaping.\\n\\n* Bullet point 1\\n* Bullet point 2"

Use standard Markdown syntax for the content field, but remember to escape all special characters as described above.
`;

        const response = await this.generateContent(prompt);

        // Always try to extract JSON from the response, assuming it might be wrapped in code blocks
        const extractJsonFromResponse = (text) => {
            console.log('Extracting JSON from response...');

            // Try to extract from code blocks first
            const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/;
            const codeBlockMatch = text.match(codeBlockRegex);

            if (codeBlockMatch && codeBlockMatch[1]) {
                console.log('Found code block, extracting JSON...');
                const jsonContent = codeBlockMatch[1].trim();
                return jsonContent;
            }

            // If no code block found, try to find array-like content
            const arrayRegex = /(\[\s*\{[\s\S]*\}\s*\])/;
            const arrayMatch = text.match(arrayRegex);

            if (arrayMatch && arrayMatch[1]) {
                console.log('Found array-like content, extracting...');
                return arrayMatch[1].trim();
            }

            // If nothing found, return the original text (it might be valid JSON already)
            console.log('No JSON structure found, returning original text');
            return text;
        };

        // Add extra JSON validation
        const validateAndRepairJson = (jsonString) => {
            try {
                // First try direct parsing
                return JSON.parse(jsonString);
            } catch (parseError) {
                console.log('Initial JSON parsing failed, attempting repair');

                // Common JSON escaping issues to fix
                let repairedString = jsonString;

                // Replace actual newlines within JSON strings with \n
                repairedString = repairedString.replace(/([^\\])"\s*:\s*"(.*?)([^\\])\n/gs, '$1": "$2$3\\n');

                // Escape unescaped double quotes within JSON strings
                repairedString = repairedString.replace(/([^\\])"/g, '$1\\"');

                // Fix double-escaped quotes
                repairedString = repairedString.replace(/\\\\"/g, '\\"');

                // Restore the opening/closing quotes of JSON properties and values
                repairedString = repairedString.replace(/\\"/g, '"');

                try {
                    return JSON.parse(repairedString);
                } catch (repairError) {
                    throw new Error(`Failed to repair JSON: ${repairError.message}`);
                }
            }
        };

        try {
            // Extract the JSON content from the response
            const extractedJson = extractJsonFromResponse(response);
            console.log('Attempting to parse extracted content as JSON');

            // Parse and validate the extracted content
            const parsedContent = validateAndRepairJson(extractedJson);

            // Validate the content structure
            if (Array.isArray(parsedContent) && parsedContent.length > 0) {
                // Check if each item has required properties
                const isValid = parsedContent.every(segment =>
                    segment &&
                    typeof segment === 'object' &&
                    'type' in segment &&
                    'title' in segment &&
                    'content' in segment
                );

                if (isValid) {
                    console.log('Successfully parsed valid content structure');
                    return parsedContent;
                } else {
                    throw new Error('Invalid segment structure in JSON array');
                }
            } else {
                throw new Error('Parsed content is not an array or is empty');
            }
        } catch (e) {
            console.error('Failed to parse module content:', e.message);
            console.error('Response excerpt:', response.substring(0, 500) + '...');

            // Return a fallback segment
            const fallbackSegment = [{
                type: "article",
                title: "Module Content",
                content: `## There was an error generating structured content\n\nThe system was unable to generate properly formatted content segments. \n\nPlease try again, or contact the administrator if the issue persists.\n\n---\n\n### Technical Details\n\nError: ${e.message}`,
                section: "Content"
            }];

            return fallbackSegment;
        }
    }

    // Generate pathway structure using the provided prompt
    async generatePathwayStructure(pathway, userPrompt, attachedFiles = []) {
        // Format modules for the prompt
        const modules = pathway.modules || [];
        const formattedModules = modules.map(module => ({
            name: module.name,
            concepts: module.concepts,
            prerequisites: module.prerequisites ? module.prerequisites.flat() : [],
            key: module.key
        }));

        const attachedFilesText = attachedFiles.map(file => {
            return `Filename: ${file.name}\nContent: ${file.content}`;
        }).join('\n\n');

        const prompt = `
        Review the following learning pathway (EXHIBIT_A), and consider applying changes to the "modules" DAG (which is represented in JSON). Only consider making changes that are inspired by the new context provided by the user prompt (EXHIBIT_B), and the attached files. Do your best to identify the main content within each attached file, and ignore any irrelevant text within each file.

        Your entire output MUST be in raw JSON format without any markdown formatting (no \`\`\`json or \`\`\` markers), and it MUST ONLY include the following two properties:
        1. modules: JSON array representing the entire modules JSON after applying your changes. You may: leave everything as-is if you think the context from attached files is not relevant, add/modify concepts within an existing module, consolidate modules into one, create new modules, and remove modules if needed. This JSON represents a DAG, so be sure to avoid any circular references within prerequisites.
        2. summary: A string representing a single paragraph briefly summarizing your changes.

        Each JSON object representing a single module only has four properties:
        1. name: A unique string representing the name of this module.
        2. concepts: A list of strings representing the main concepts covered by this module.
        3. prerequisites: A list of strings representing the keys of modules that must be completed by students before they can start this module.
        4. key: The key of the module for prerequisite linking

        Be sure to follow the specified format exactly, otherwise your response will not be accepted. DO NOT include markdown code block markers or any text before or after the JSON object.
        
        EXHIBIT_A: {
            title: ${pathway.title || ''},
            goal: ${pathway.goal || ''},
            requirements: ${pathway.requirements || ''},
            description: ${pathway.description || ''},
            modules: ${JSON.stringify(formattedModules)}
        }

        EXHIBIT_B: ${userPrompt}
        
        ATTACHED_FILES: 
        ${attachedFilesText}
        `;

        const response = await this.generateContent(prompt);
        try {
            // First try direct parsing
            return JSON.parse(response);
        } catch (e) {
            console.log('Direct parsing failed, trying to extract JSON from markdown code block');

            // Try to extract JSON from markdown code block
            const jsonBlockRegex = /```(?:json)?\s*(\{[\s\S]*\})\s*```/m;
            const match = response.match(jsonBlockRegex);

            if (match && match[1]) {
                try {
                    return JSON.parse(match[1]);
                } catch (e2) {
                    console.error('Failed to parse JSON from code block:', e2);
                    throw new Error('Failed to parse pathway structure from Gemini response');
                }
            }

            // If no code block found, try to find any JSON object in the response
            const jsonObjectRegex = /(\{[\s\S]*\})/;
            const objectMatch = response.match(jsonObjectRegex);

            if (objectMatch && objectMatch[1]) {
                try {
                    return JSON.parse(objectMatch[1]);
                } catch (e3) {
                    console.error('Failed to find valid JSON in response:', e3);
                    throw new Error('Failed to parse pathway structure from Gemini response');
                }
            }

            console.error('Failed to extract JSON from response:', e);
            throw new Error('Failed to parse pathway structure from Gemini response');
        }
    }
}

module.exports = new GeminiService();
