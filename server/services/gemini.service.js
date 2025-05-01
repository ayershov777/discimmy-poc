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
        // Using the provided module HTML generator function format
        const prereqsArray = module.prerequisites || [[]];
        const prereqsString = JSON.stringify(prereqsArray);

        const conceptsArray = module.concepts || [];
        const conceptsString = conceptsArray.map((concept, index) => `${index + 1}. ${concept}`).join('\n');

        const prompt = `
        **Objective:** Create an HTML file presenting an introductory learning module focused on ${module.name || 'this topic'}, designed for ${pathway.targetAudience || 'learners'}.

        **Core Concepts to Cover:**
        Organize the module around the following core concepts, provided in a logical sequence:
        ${conceptsString}

        **Context within Learning Pathway:**
        * **Prerequisite Knowledge:** Assumes completion of the following prerequisite modules and understanding of their associated concepts. Include a brief activation of prior knowledge related to these concepts in the Warmup segment(s).
            * Prerequisites: ${prereqsString}

        * **Leads To:** This module serves as a prerequisite for future modules.

        **Module Presentation Structure:**
        * **Information Architecture:** Structure the module logically by concept using sequentially numbered sections. Use top-level headings (H2) for major concepts or sections. Use lower-level headings (H3, H4) for individual segments within those sections. Do NOT include explicit "Phase" titles or phase numbers in the learner-facing output.
        * **Segment Types:** Break the module content into distinct segments using the following types: article, research, exercise, session, project. The type should be clear visually (see Styling) but NOT indicated with bracketed text labels like [article] in the final output.
        * **Learner-Facing Content Only:** Ensure the final HTML output contains ONLY content intended for the learner. Omit any internal instructions, meta-labels, preparation notes, session guidance text separate from the main description, system requirement notes, or other scaffolding text used in this prompt.

        **Segment Content & Instructions:**

        * **Warmup Segment(s):**
            * Start the module with one or more introductory segments designated for warmup.
            * Purpose: Activate relevant prior knowledge from the listed prerequisite concepts, establish context for the new module, and prime for new learning.
            * Components: Keep brief. Include relevance framing (why this topic matters), prior knowledge activation (e.g., self-assessment questions related to prerequisite concepts), and curiosity stimulation (e.g., engaging question/problem related to the module topic).
        * **research Segments:**
            * Purpose: Introduce new concepts through guided investigation.
            * This is the primary segment for knowledge transfer and should be used for most of the module's content.
            * Provide specific questions or tasks for students to investigate related to the concept being introduced.
            * Provide direct hyperlinks to specific pages within reliable online resources that help answer the research questions. Ensure links open in a new tab.
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
            * Include *at least two* distinct integration segments (e.g., exercises or mini-projects) of graduating complexity after several core concepts have been introduced and applied, but before the final consolidation section. These should require learners to synthesize multiple concepts or apply them in broader scenarios relevant to the module's domain. Increase the number of integration segments for modules covering more complex or numerous concepts.
        * **session Segments (Peer Mentoring):**
            * **General Placement:** Learner Focus sessions are placed throughout the module after relevant exercises. Mentor Focus sessions are placed only within the Consolidation Section. The platform's underlying system requires a 1:1 balance: participation in a Learner Focus session creates an obligation to complete a Mentor Focus session for module completion. **Generate *exactly* one Mentor Focus session for each Learner Focus session generated.** Do NOT mention this system requirement directly in the learner-facing HTML output.
            * **Learner Focus Sessions:**
                * **Placement:** Include Learner Focus session segments immediately after relevant application exercises throughout the module where feedback would be beneficial.
                * **Function:** Within a Learner Focus session, the student initiating the session (Learner) focuses on a specific concept (Concept X) or exercise outcome they just worked on. They review their work with a peer mentor, identify confusion points, ask specific questions, and receive feedback/clarification related to that specific work.
                * **Task Definition:** Define concrete, actionable tasks driven by the Learner's needs for the specific concept or exercise review.
                * **Waiting Instruction:** Include clear instructions for the learner while waiting for a peer match: "While waiting for a peer mentor connection, you should proceed to the next segment in the module. Alternatively, you can use this time to review the key concepts and resources related to the segment you just completed."
            * **Mentor Focus Sessions (Described Here, Placed ONLY in Consolidation Section):**
                * **Placement:** Generate these segments ONLY within the final Consolidation Section, *before* the project segment. Ensure the number matches the number of Learner Focus sessions.
                * **Function:** These sessions fulfill the reciprocal participation requirement. Each session focuses on a single, specific key concept (Concept Y) covered *earlier in the module*. Clearly state the specific Concept Y this session targets within the learner-facing description.
                * **Role:** The student acts as a mentor for a peer needing help with Concept Y. Both mentor and learner in this session are focused *only* on Concept Y.
                * **Purpose (Learner View):** Frame the purpose purely around pedagogical benefits for the student *acting as the mentor*, e.g., "Reinforce your understanding of Concept Y by explaining it to a peer," "Solidify your knowledge through teaching," or "Help a fellow learner while deepening your own comprehension (the protege effect)."
                * **Mentor Preparation:** Include clear instructions *within the session segment description* guiding the student (acting as mentor) on how to prepare for mentoring on Concept Y (e.g., review the concept using module resources, anticipate questions their peer might have about Concept Y based on earlier exercises, plan simple explanations or examples for Concept Y). These preparation instructions ARE learner-facing for the student acting as mentor.
                * **Session Guidance (for the Mentor):** Note that the actual session activities will be guided by the Learner's needs regarding Concept Y. The Mentor's role is to respond, explain Concept Y, review the peer's work related to Concept Y, answer questions about Concept Y, and guide corrections related to Concept Y. These guidance points ARE learner-facing for the student acting as mentor.
                * **Waiting Instruction:** Include clear instructions for the student (acting as mentor) while waiting for a peer match, and done with mentor preperation.
            * **Project Presentation Sessions:**
                * **Placement:** Generate this segment once after the final project.
                * **Function:** This session focuses on the project segment. The student reviews their project with a peer, discusses challenges, and shares reflections on the project. There are no mentor/mentee roles in this session, and this session doesn't require a 1:1 balance.
                * **Task Definition:** Define concrete, actionable tasks driven by the students' needs for the project review.
        * **Consolidation Section:** Include a final major section dedicated to consolidation. This section should contain the Mentor Focus Sessions first, followed by the Project Segment, and then the final Project-related Learner Focus Session (if included).
        * **project Segment (Place ONLY in Consolidation Section, AFTER Mentor Sessions):**
            * Purpose: Synthesize module concepts in a significant application task.
            * Include one final project segment. Make this section detailed and clearly structured for the learner.
            * **Project Structure:** Structure the project description using the following clear, learner-friendly stages with descriptive headings. Adapt the specific guidance within each stage to be relevant to the module's topic:
                1.  **Getting Started:** Describe the project goal clearly. Provide a simple real-world context or scenario (using fictional details). Briefly mention the key concepts from this module that will be needed. Explain the learning value (what the student will be able to do). List clear, domain-relevant success criteria for the final deliverable. Mention necessary tools or materials, and where to get them.
                2.  **Planning Your Project:** Provide simple, guided steps for planning relevant to the project type.
                3.  **Building Step-by-Step:** Define at least 3 clear, manageable milestones with instructions.
                4.  **(Optional) Adding Polish / Challenge:** Suggest an optional small enhancement, e.g., "Try applying [Advanced Concept Z]," or "Consider alternative interpretations/designs."
                5.  **Final Review & Reflection:** Instruct the learner to do a final check against the success criteria and perform any final validation relevant to the domain. Include 2-3 specific reflection prompts relevant to the learning process and the module's content.
            * Define core requirements for the final project artifact clearly.
            * **IMPORTANT:** Reiterate that placeholder or fictional information should be used instead of personal details.

        **Output Format:**
        * Provide the complete module in a well-structured, valid HTML format.
        * Use semantic HTML elements where appropriate (e.g., \`article\`, \`section\` if applicable for segment grouping, standard content tags like \`h1\`-\`h6\`, \`p\`, \`ul\`, \`ol\`, \`li\`, \`a\`, \`img\`, \`code\`, \`em\`, \`strong\`).
        * Employ simple, accessible styling using embedded CSS.
            * **Theme:** Use a clean, professional theme with high contrast. Ensure text is easily readable against backgrounds. Use distinct, consistent, accessible accent colors (with sufficient contrast ratios against text and background) to visually differentiate segment types (e.g., using border-left colors). Ensure link colors are standard and clear.
            * **Structure:** Use clear headings (H1 for module title, H2 for major sections/concepts, H3/H4 for segments). Ensure consistent spacing and layout for readability.
        * The final HTML output must be ready for direct presentation to a learner and contain no internal notes, meta-labels, or instructions intended for the AI.
        * **HTML Syntax and Escaping:**
            * The generated HTML output must strictly use HTML tags for all formatting and structure. **Absolutely NO markdown syntax should appear in the final HTML content presented to the learner, unless the module is explaining markdown.** Use appropriate HTML tags like \`<strong>\` for strong importance, \`<em>\` for emphasis, \`<code>\` for inline code or technical terms, \`<p>\` for paragraphs, \`<ul>/<ol>/<li>\` for lists, \`<a>\` for links, etc.
            * Double check that the generated HTML is not broken and structurally valid.
            * Crucially, ensure that any example text snippets or mentions of specific syntax (if applicable to the domain, and wrapped in \`<code>\` tags) within the learner-facing content are displayed correctly. Ensure that literal angle brackets (\`<\`, \`>\`) used within content (e.g., in a code example or mathematical formula) are properly escaped using HTML entities (e.g., \`&lt;\` for \`<\`, \`&gt;\` for \`>\`). Ensure literal ampersands (\`&\`) are escaped as \`&amp;\`.
            * Ensure that HTML tags intended as actual document markup (like the \`<h2>\`, \`<p>\`, \`<a>\` tags structuring the module itself) are correctly formed and NOT accidentally escaped.
        `;

        return this.generateContent(prompt);
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
