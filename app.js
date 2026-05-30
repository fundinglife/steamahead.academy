const grades = [
  ["Pre-K", "PK", "#0798d1", "Sort shapes, compare sizes, count small groups, hear rhymes, and name letters.", [["Math", "128 skills"], ["Reading readiness", "84 skills"]]],
  ["Kindergarten", "K", "#f28c28", "Count to 100, compose shapes, match sounds, observe living things, and explore communities.", [["Math", "210 skills"], ["Language arts", "154 skills"]]],
  ["First grade", "1", "#62b233", "Add and subtract, read short texts, classify materials, and practice civic routines.", [["Math", "238 skills"], ["Science", "76 skills"]]],
  ["Second grade", "2", "#cf4d4d", "Work with place value, fluency, measurement, grammar, maps, plants, and animal habitats.", [["Math", "246 skills"], ["Language arts", "188 skills"]]],
  ["Third grade", "3", "#0798d1", "Multiply, divide, interpret graphs, analyze stories, study weather, and use sources.", [["Math", "263 skills"], ["Social studies", "92 skills"]]],
  ["Fourth grade", "4", "#7661bd", "Compare fractions, revise paragraphs, investigate energy, and understand regions.", [["Math", "271 skills"], ["Language arts", "205 skills"]]],
  ["Fifth grade", "5", "#1da99a", "Build decimal fluency, cite evidence, model ecosystems, and interpret historical events.", [["Math", "286 skills"], ["Science", "118 skills"]]],
  ["Sixth grade", "6", "#f28c28", "Ratios, expressions, informational reading, Earth systems, and world geography.", [["Math", "304 skills"], ["Language arts", "231 skills"]]],
  ["Seventh grade", "7", "#438522", "Proportional reasoning, argument writing, cells, genetics, economics, and civics.", [["Math", "295 skills"], ["Science", "129 skills"]]],
  ["Eighth grade", "8", "#d6a307", "Linear relationships, transformations, rhetoric, physical science, and U.S. history.", [["Math", "312 skills"], ["Social studies", "144 skills"]]],
  ["High school", "HS", "#7661bd", "Algebra, geometry, statistics, biology, chemistry, literature, government, and finance.", [["Math", "420 skills"], ["Language arts", "260 skills"]]],
  ["Spanish", "ES", "#f28c28", "Vocabulary, grammar, listening, reading, and culture for beginner through advanced learners.", [["Spanish", "168 skills"], ["Conversation", "52 sets"]]],
];

const skills = [
  ["Fractions on number lines", "Place fractions accurately and compare their size.", "Grade 3 math", "#0798d1"],
  ["Text evidence", "Choose the sentence that best supports an inference.", "Grade 5 reading", "#62b233"],
  ["Photosynthesis models", "Predict how light, water, and carbon dioxide affect plant growth.", "Middle school science", "#1da99a"],
  ["Linear functions", "Identify slope, intercepts, and real-world rate of change.", "Algebra 1", "#7661bd"],
  ["Primary sources", "Use evidence to explain point of view and historical context.", "U.S. history", "#cf4d4d"],
];

const pages = {
  "/learning": {
    title: "Learning",
    description: "Browse structured K-12 learning paths with adaptive practice, concise instruction, hints, worked examples, and mastery checks.",
    items: [
      ["Skill plans", "Students follow focused plans organized around standards, classroom goals, or diagnostic recommendations. Each plan mixes fluency, reasoning, vocabulary, and review."],
      ["Grade pathways", "Every grade pathway includes core skills, prerequisite review, stretch goals, and cumulative practice so learners can move forward without losing foundations."],
      ["Standards explorer", "Teachers can browse by subject, grade, domain, and standard to find aligned practice and assign the right skill set in minutes."],
      ["Daily recommendations", "Recommendations update after each session, balancing new learning with spaced review and skills that need another attempt."],
    ],
  },
  "/assessment": {
    title: "Assessment",
    description: "Use short adaptive checks to understand readiness, growth, and gaps before assigning practice.",
    items: [
      ["Universal screener", "A quick check estimates current level across major domains and creates a practical starting point for each learner."],
      ["Readiness checks", "Before a unit, students answer targeted questions that reveal prerequisite strengths and areas needing review."],
      ["Growth snapshots", "Progress views compare recent evidence with prior performance to show momentum over time."],
      ["Student action plans", "Assessment results become specific recommendations rather than static scores."],
    ],
  },
  "/diagnostic": {
    title: "Diagnostic",
    description: "A learner-friendly diagnostic estimates current readiness and turns each result into a recommended practice path.",
    items: [
      ["Adaptive questions", "Question difficulty changes as students respond, keeping the check efficient while collecting useful evidence."],
      ["Readiness levels", "Results summarize strengths and next steps by domain so learners know where to begin."],
      ["Actionable recommendations", "The diagnostic points students toward a balanced mix of review, grade-level work, and stretch skills."],
      ["Teacher visibility", "Teachers see class trends, student-level needs, and suggested groups for follow-up instruction."],
    ],
  },
  "/analytics": {
    title: "Analytics",
    description: "Turn learner activity into clear instructional decisions for students, families, teachers, and administrators.",
    items: [
      ["Class insights", "See which skills are secure, which need reteaching, and which students are ready for extension."],
      ["Skill trouble spots", "Common wrong-answer patterns highlight misconceptions and help teachers plan small-group instruction."],
      ["Usage trends", "Track practice time, questions attempted, persistence, and completion across learners or classrooms."],
      ["Standards mastery", "Roll up skill evidence by standard to support reporting, conferences, and instructional planning."],
    ],
  },
  "/families": {
    title: "Families",
    description: "Support homework, enrichment, intervention, and confidence-building with clear goals and simple progress views.",
    items: [
      ["Parent dashboard", "Families see current goals, recent wins, skills that need practice, and suggested next sessions."],
      ["Weekly goals", "Learners can set a weekly practice target and track progress without turning learning into busywork."],
      ["Progress notes", "Short updates explain what improved, what remains challenging, and what to practice next."],
      ["Flexible memberships", "Family plans support one learner or multiple children across different grades and subjects."],
    ],
  },
  "/inspiration": {
    title: "Inspiration",
    description: "Explore practical learning routines, implementation stories, and research-informed teaching ideas.",
    items: [
      ["Teacher stories", "Classroom examples show how teachers use practice, diagnostics, and review routines across different schedules."],
      ["Research notes", "Plain-language summaries connect product decisions to learning science and classroom evidence."],
      ["Implementation guides", "Step-by-step routines help schools launch practice goals, diagnostics, and data meetings."],
      ["Student celebrations", "Milestones highlight effort, growth, persistence, and mastery across subjects."],
    ],
  },
  "/awards": {
    title: "Awards",
    description: "Celebrate effort, persistence, growth, and mastery with meaningful milestones across subjects and grade levels.",
    items: [
      ["Daily milestones", "Learners earn recognition for focused practice, completing assigned skills, and returning for review."],
      ["Mastery badges", "Badges mark secure understanding in a concept area after consistent evidence across question types."],
      ["Progress boards", "Students can see personal progress without comparing private performance against classmates."],
      ["Teacher celebrations", "Teachers can highlight growth, persistence, and improvement during classroom routines."],
    ],
  },
  "/recommendations": {
    title: "Recommendations",
    description: "Recommended skills combine diagnostic evidence, recent practice, assigned work, and long-term review needs.",
    items: [
      ["Next best skill", "The system suggests one focused skill at a time so learners can start quickly."],
      ["Prerequisite repair", "When a student struggles, recommendations step back to the missing foundation."],
      ["Spaced review", "Previously learned skills return after time has passed to strengthen retention."],
      ["Teacher priorities", "Assigned topics and classroom units influence which recommendations appear first."],
    ],
  },
  "/fluency-zone": {
    title: "Fluency zone",
    description: "Short practice rounds help learners build speed, accuracy, and confidence with essential facts and routines.",
    items: [
      ["Math facts", "Addition, subtraction, multiplication, and division rounds support automatic recall."],
      ["Word reading", "Phonics and high-frequency word practice build quick recognition and decoding."],
      ["Timed rounds", "Optional timed sets encourage focus while keeping feedback supportive and low-stakes."],
      ["Accuracy first", "Learners are guided toward careful responses before increasing pace."],
    ],
  },
  "/lessons": {
    title: "Lessons",
    description: "Lessons introduce concepts with clear explanations, examples, guided practice, and independent checks.",
    items: [
      ["Mini lesson", "Each lesson begins with a concise explanation and a visual or verbal model."],
      ["Worked examples", "Step-by-step examples show how to approach common problem types."],
      ["Guided practice", "Hints and feedback help students apply the idea before practicing independently."],
      ["Exit check", "A short final check confirms whether the learner is ready to continue."],
    ],
  },
  "/games": {
    title: "Games",
    description: "Practice games give students another way to rehearse facts, vocabulary, logic, and concept fluency.",
    items: [
      ["Fact fluency games", "Quick rounds reinforce number facts, mental math, and pattern recognition."],
      ["Vocabulary games", "Matching, sorting, and context games help learners build academic language."],
      ["Strategy puzzles", "Logic and reasoning puzzles strengthen persistence and flexible thinking."],
      ["Teacher controls", "Games can be limited by subject, grade, skill, or practice goal."],
    ],
  },
  "/videos": {
    title: "Videos",
    description: "Short instructional videos explain key ideas and model problem-solving strategies.",
    items: [
      ["Concept explainers", "Videos introduce new ideas with plain language and focused examples."],
      ["Strategy walkthroughs", "Students can watch a process before trying similar questions."],
      ["Review clips", "Brief refreshers help learners revisit prior skills before practice."],
      ["Classroom use", "Teachers can pair videos with assignments, small-group work, or homework."],
    ],
  },
  "/math": {
    title: "Math",
    description: "Practice number sense, operations, algebraic thinking, geometry, measurement, data, probability, statistics, and advanced high-school math.",
    items: [
      ["Early math", "Counting, comparing, shapes, patterns, measurement language, and early addition and subtraction."],
      ["Elementary math", "Place value, multi-digit operations, fractions, decimals, geometry, measurement, graphs, and word problems."],
      ["Middle school math", "Ratios, proportional relationships, integers, expressions, equations, geometry, statistics, and probability."],
      ["High school math", "Algebra, functions, geometry, trigonometry, statistics, probability, precalculus foundations, and financial math."],
    ],
  },
  "/language-arts": {
    title: "Language arts",
    description: "Build reading, vocabulary, grammar, writing strategy, research, literary analysis, and communication skills.",
    items: [
      ["Foundational reading", "Letter names, phonological awareness, phonics, decoding, sight words, and early comprehension."],
      ["Grammar and mechanics", "Parts of speech, sentence structure, punctuation, capitalization, usage, and editing."],
      ["Reading comprehension", "Main idea, inference, theme, text structure, author purpose, evidence, and comparison."],
      ["Writing strategies", "Planning, organization, transitions, precise language, revision, argument, narrative, and informative writing."],
    ],
  },
  "/science": {
    title: "Science",
    description: "Explore life science, Earth and space science, physical science, engineering practices, data, and scientific reasoning.",
    items: [
      ["Life science", "Plants, animals, habitats, cells, body systems, heredity, adaptation, ecosystems, and cycles."],
      ["Earth and space", "Weather, climate, rocks, landforms, natural resources, Earth systems, the Moon, planets, and stars."],
      ["Physical science", "Matter, forces, motion, energy, waves, electricity, magnetism, and chemical reactions."],
      ["Scientific practices", "Models, investigations, variables, measurement, data interpretation, evidence, and argumentation."],
    ],
  },
  "/social-studies": {
    title: "Social studies",
    description: "Practice geography, civics, economics, history, source analysis, cultural understanding, and map skills.",
    items: [
      ["Geography", "Maps, landforms, regions, climate, resources, population, migration, and human-environment interaction."],
      ["Civics", "Rules, rights, responsibilities, branches of government, citizenship, elections, and public policy."],
      ["History", "Chronology, cause and effect, historical context, U.S. history, world history, and local history."],
      ["Source analysis", "Primary sources, secondary sources, point of view, evidence, reliability, and argument."],
    ],
  },
  "/spanish": {
    title: "Spanish",
    description: "Learn Spanish vocabulary, grammar, listening, reading, sentence building, culture, and conversation foundations.",
    items: [
      ["Vocabulary", "Greetings, school, family, food, travel, time, weather, descriptions, routines, and community words."],
      ["Grammar", "Nouns, articles, adjectives, pronouns, present tense, common irregular verbs, questions, and negation."],
      ["Listening and reading", "Short passages and audio-style prompts build comprehension in realistic contexts."],
      ["Conversation", "Learners practice useful exchanges, personal introductions, preferences, requests, and everyday responses."],
    ],
  },
  "/schools": {
    title: "Schools",
    description: "Classroom tools help teachers assign practice, monitor progress, and respond to learner needs.",
    items: [
      ["Class rosters", "Teachers organize learners by class period, group, intervention block, or enrichment cohort."],
      ["Assignments", "Assign one skill, a topic sequence, a readiness check, or a weekly practice goal."],
      ["Teacher reports", "Reports summarize time, accuracy, mastery, trouble spots, and recommended next steps."],
      ["Intervention groups", "Group students by shared need for small-group instruction and targeted review."],
    ],
  },
  "/core-curriculum": {
    title: "Core curriculum",
    description: "Core curriculum pathways combine lessons, practice, diagnostics, review, and reporting for full-course support.",
    items: [
      ["Unit sequence", "Skills are arranged into coherent units with prerequisites, practice, and cumulative review."],
      ["Instructional support", "Teachers can use lesson materials, examples, and checks alongside classroom instruction."],
      ["Practice engine", "Students move from guided examples to independent questions with targeted feedback."],
      ["Progress reporting", "Unit, standard, and skill-level reporting shows what is ready and what needs reteaching."],
    ],
  },
  "/districts": {
    title: "Districts",
    description: "District leaders can support implementation, standards coverage, usage visibility, and learning growth.",
    items: [
      ["Admin dashboard", "See adoption, activity, completion, and growth across schools, grades, and subjects."],
      ["Usage reporting", "Monitor practice trends and identify where training or implementation support is needed."],
      ["Standards coverage", "Understand how assigned skills map to district priorities and grade-level expectations."],
      ["Professional learning", "Launch teacher onboarding, reporting routines, and data-use practices."],
    ],
  },
  "/independent-learners": {
    title: "Independent learners",
    description: "Self-paced paths support teens, adults, homeschoolers, and lifelong learners who want structured practice.",
    items: [
      ["Placement check", "A short diagnostic helps learners choose a starting level without guessing."],
      ["Goal planner", "Learners select a subject, weekly schedule, and target skill set."],
      ["Study streaks", "Visible progress encourages consistent practice and review."],
      ["Review mode", "Past trouble spots return at the right time for spaced reinforcement."],
    ],
  },
  "/high-school": {
    title: "High school",
    description: "Support core courses, credit recovery, college readiness, and independent review across high-school subjects.",
    items: [
      ["Algebra", "Expressions, equations, inequalities, systems, functions, polynomials, factoring, and quadratics."],
      ["Geometry", "Angles, triangles, congruence, similarity, circles, area, volume, coordinate geometry, and proofs."],
      ["Biology", "Cells, genetics, evolution, ecosystems, body systems, lab skills, and data interpretation."],
      ["English literature", "Theme, character, structure, figurative language, argument, rhetoric, and evidence-based writing."],
    ],
  },
  "/membership": {
    title: "Membership",
    description: "Choose access for one learner, a family, a classroom, a school, or a district implementation.",
    items: [
      ["Monthly family plan", "Flexible access for one or more learners with progress tracking and subject pathways."],
      ["Annual family plan", "A lower-cost annual option for consistent practice across the school year."],
      ["Classroom license", "Teacher-managed assignments, reports, rosters, and intervention groups."],
      ["School quote", "School and district plans include implementation support, reporting, and rostering options."],
    ],
  },
  "/sign-in": {
    title: "Sign in",
    description: "Access learner dashboards, teacher tools, family reports, and administrator views.",
    items: [
      ["Student sign in", "Students continue assignments, recommendations, diagnostics, and practice streaks."],
      ["Teacher sign in", "Teachers manage classes, assignments, reports, and small-group recommendations."],
      ["Family sign in", "Families review progress, goals, membership details, and recommended practice."],
      ["Administrator sign in", "Leaders monitor usage, implementation, standards coverage, and school-level trends."],
    ],
  },
  "/about": {
    title: "About",
    description: "SteamAhead Academy is an original concept for structured K-12 practice, diagnostics, and reporting.",
    items: [
      ["Mission", "Help every learner build durable skills through practice that is clear, responsive, and motivating."],
      ["Curriculum approach", "Content is organized by concepts, prerequisites, grade pathways, and long-term retention."],
      ["Accessibility", "Readable layouts, keyboard-friendly navigation, responsive design, and plain-language instructions guide the product."],
      ["Privacy-first design", "Account and reporting flows are designed around minimal data collection and clear controls."],
    ],
  },
  "/company": {
    title: "Company",
    description: "SteamAhead Academy is organized around high-quality learning content, accessible product design, and practical school support.",
    items: [
      ["What we build", "Curriculum practice, diagnostics, recommendations, analytics, and family learning tools."],
      ["Who we serve", "Students, families, teachers, school leaders, independent learners, and tutoring programs."],
      ["How we work", "Teams combine curriculum expertise, engineering, design, research, and customer support."],
      ["What matters", "Clarity, usefulness, learner confidence, accessibility, and measurable progress."],
    ],
  },
  "/research": {
    title: "Research",
    description: "Evidence summaries and learning-science notes explain the educational model behind the product.",
    items: [
      ["Practice effects", "Frequent low-stakes practice builds fluency when paired with feedback and review."],
      ["Assessment design", "Short diagnostics are most useful when they lead directly to actionable learning steps."],
      ["Retention", "Spaced review and cumulative practice help learners keep skills active beyond a single lesson."],
      ["Implementation studies", "School routines matter: goal setting, teacher review, and timely intervention improve consistency."],
    ],
  },
  "/careers": {
    title: "Careers",
    description: "Build learning tools for students, educators, families, and school leaders.",
    items: [
      ["Engineering", "Create accessible product experiences, reporting tools, assessment systems, and learning workflows."],
      ["Curriculum", "Design original practice, explanations, hints, and assessments across K-12 subjects."],
      ["Design", "Shape clear interfaces for students, families, teachers, and administrators."],
      ["Customer success", "Support schools and families with onboarding, training, and implementation routines."],
    ],
  },
  "/help": {
    title: "Help center",
    description: "Find support for accounts, assignments, memberships, reporting, accessibility, and technical setup.",
    items: [
      ["Getting started", "Create an account, choose a role, select a pathway, and begin practice."],
      ["Billing", "Manage memberships, renewals, invoices, cancellations, and plan changes."],
      ["Rostering", "Set up classes, import students, manage groups, and archive old rosters."],
      ["Troubleshooting", "Resolve sign-in issues, browser problems, audio playback, and reporting questions."],
    ],
  },
  "/user-guides": {
    title: "User guides",
    description: "Role-based guides help students, families, teachers, and administrators get value from the platform quickly.",
    items: [
      ["Student guide", "Start practice, read feedback, use hints responsibly, and track goals."],
      ["Family guide", "Set up learners, choose subjects, review progress, and support weekly routines."],
      ["Teacher guide", "Create classes, assign skills, interpret reports, and plan intervention groups."],
      ["Administrator guide", "Review implementation data, manage access, and support school-wide routines."],
    ],
  },
  "/feedback": {
    title: "Feedback",
    description: "Share product ideas, report content concerns, and help improve the learning experience.",
    items: [
      ["Product ideas", "Suggest workflow improvements, new reports, accessibility updates, or classroom tools."],
      ["Content feedback", "Report confusing wording, answer concerns, alignment questions, or lesson improvements."],
      ["Technical issues", "Send browser, sign-in, audio, display, or performance problems to support."],
      ["Research participation", "Volunteer for interviews, surveys, pilots, or usability studies."],
    ],
  },
  "/privacy": {
    title: "Privacy",
    description: "Privacy principles describe how learner information should be collected, protected, used, and controlled.",
    items: [
      ["Data minimization", "Collect only what is needed to operate accounts, learning activity, reporting, and support."],
      ["Role-based access", "Students, families, teachers, and administrators see information appropriate to their role."],
      ["Security practices", "Account, roster, billing, and activity data require careful technical and operational safeguards."],
      ["User controls", "Families and schools need clear ways to manage accounts, communications, and data requests."],
    ],
  },
  "/terms": {
    title: "Terms",
    description: "Terms explain acceptable use, account responsibilities, subscriptions, school access, and content ownership.",
    items: [
      ["Accounts", "Users are responsible for accurate account information and appropriate access protection."],
      ["Acceptable use", "The service is for learning, instruction, reporting, support, and authorized educational activity."],
      ["Subscriptions", "Membership terms cover billing, renewals, cancellations, and plan changes."],
      ["Content rights", "Original platform content remains protected while users retain rights to their own submitted material."],
    ],
  },
  "/contact": {
    title: "Contact",
    description: "Reach support, sales, partnerships, media, or school implementation teams.",
    items: [
      ["Support", "Get help with accounts, assignments, progress, billing, or technical issues."],
      ["Sales", "Discuss family, classroom, school, and district access options."],
      ["Partnerships", "Connect about curriculum alignment, integrations, or community programs."],
      ["Media", "Request company information, research summaries, or product background."],
    ],
  },
};

function gradeCard([name, badge, color, summary, lines]) {
  return `
    <article class="card" style="--accent:${color}">
      <div class="grade-heading">
        <span class="grade-badge">${badge}</span>
        <h3>${name}</h3>
      </div>
      <p>${summary}</p>
      <div class="skill-lines">
        ${lines.map(([label, count]) => `<a href="#/${slug(label)}"><span>${label}</span><span>${count} ›</span></a>`).join("")}
      </div>
    </article>
  `;
}

function skillCard([title, body, tag, color]) {
  return `
    <article class="skill-card" style="--accent:${color}">
      <strong>${title}</strong>
      <p>${body}</p>
      <span>${tag}</span>
    </article>
  `;
}

function slug(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function homePage() {
  return `
    <section class="hero">
      <div class="section-inner">
        <p class="eyebrow">Personalized K-12 practice</p>
        <h1>Learning paths that move with every student</h1>
        <p class="hero-copy">
          SteamAhead Academy combines curriculum practice, adaptive readiness checks,
          and clear progress reporting in one original learning experience.
        </p>
        <div class="hero-actions">
          <a class="button button-green" href="#/membership">Become a member</a>
          <a class="button button-secondary" href="#/learning">Explore curriculum</a>
        </div>
        <div class="feature-row">
          <article class="feature">
            <div class="feature-icon">K</div>
            <h2>Complete K-12 pathways</h2>
            <p>Math, reading, writing, science, social studies, and Spanish practice organized by grade.</p>
          </article>
          <article class="feature">
            <div class="feature-icon">✓</div>
            <h2>Built for real classrooms</h2>
            <p>Assignments, growth checks, and review recommendations support daily instruction.</p>
          </article>
          <article class="feature">
            <div class="feature-icon">↗</div>
            <h2>Progress students can see</h2>
            <p>Milestones, skill streaks, and dashboards make effort and mastery visible.</p>
          </article>
        </div>
      </div>
    </section>

    <section class="promo-band">
      <div class="section-inner promo-grid">
        <article class="promo" style="--promo-color:#7661bd">
          <div class="promo-visual">HS</div>
          <div>
            <h2>High school course support</h2>
            <p>Practice for algebra, geometry, biology, writing, and history with clear readiness checks.</p>
            <a href="#/high-school">View high school ›</a>
          </div>
        </article>
        <article class="promo" style="--promo-color:#1da99a">
          <div class="promo-visual">ID</div>
          <div>
            <h2>Independent learners</h2>
            <p>Self-paced plans for enrichment, remediation, test prep, and adult learning goals.</p>
            <a href="#/independent-learners">Start a plan ›</a>
          </div>
        </article>
      </div>
    </section>

    <section class="section">
      <div class="section-inner">
        <div class="section-title">
          <h2>Choose a grade or subject</h2>
          <p>Each pathway includes focused skills, short explanations, practice questions, and progress feedback.</p>
        </div>
        <div class="grade-grid">${grades.map(gradeCard).join("")}</div>
      </div>
    </section>

    <section class="section section-wash">
      <div class="section-inner">
        <div class="section-title">
          <h2>The skill plan students need next</h2>
          <p>Recommended practice adapts to recent work, readiness checks, and teacher priorities.</p>
        </div>
        <div class="skill-showcase">
          <button class="arrow" data-shift="-1" aria-label="Previous skills">‹</button>
          <div class="skill-strip" id="skill-strip">${skills.map(skillCard).join("")}</div>
          <button class="arrow" data-shift="1" aria-label="Next skills">›</button>
        </div>
        <div class="center-actions" style="margin-top:24px">
          <a class="button button-green" href="#/learning">Find a skill plan</a>
        </div>
      </div>
    </section>

    <section class="section section-blue">
      <div class="section-inner">
        <div class="section-title">
          <h2>Support for every learner</h2>
          <p>Practice, assessment, recommendations, and reporting work together.</p>
        </div>
        <div class="metric-grid">
          ${[
            ["Curriculum", "17K+", "A broad library of original skills for core subjects.", "#0798d1"],
            ["Diagnostics", "15 min", "Short checks identify readiness and next steps.", "#62b233"],
            ["Guidance", "Daily", "Recommendations update as students practice.", "#7661bd"],
            ["Analytics", "Live", "Class and learner reports surface useful patterns.", "#f28c28"],
          ].map(([title, icon, body, color]) => `
            <article class="card metric-card" style="--accent:${color}">
              <div>
                <div class="metric-icon">${icon}</div>
                <h3>${title}</h3>
                <p>${body}</p>
              </div>
              <a href="#/${slug(title)}">Learn more ›</a>
            </article>
          `).join("")}
        </div>
      </div>
    </section>

    <section class="section" style="background:#0496cf;color:#fff">
      <div class="section-inner">
        <div class="section-title">
          <h2>Learning momentum that students notice</h2>
        </div>
        <div class="quote-grid">
          ${[
            ["MR", "More confident practice", "Students get a steady rhythm of review, challenge, and correction.", "#62b233"],
            ["AL", "Flexible for classrooms", "Teachers can assign a single skill or launch a full intervention pathway.", "#f28c28"],
            ["DK", "Clear next steps", "Reports show which skills are secure and which need another pass.", "#7661bd"],
          ].map(([initials, title, body, color]) => `
            <article class="quote" style="--accent:${color}">
              <div class="avatar">${initials}</div>
              <h3>${title}</h3>
              <p>${body}</p>
            </article>
          `).join("")}
        </div>
      </div>
    </section>

    <section class="section">
      <div class="cta-panel">
        <h2>First time here?</h2>
        <p>Start with a grade pathway, a subject plan, or a short readiness check.</p>
        <div class="hero-actions">
          <a class="button button-blue" href="#/sign-in">Sign up now</a>
          <a class="button button-secondary" href="#/learning">Keep exploring</a>
        </div>
      </div>
    </section>
  `;
}

function panelPage(path) {
  const page = pages[path] || {
    title: "Page not found",
    description: "The page you requested is not part of the current SteamAhead Academy public site map.",
    items: [["Return home", "Use the main navigation to continue exploring curriculum, assessments, analytics, memberships, and support."]],
  };
  const { title, description, items } = page;
  return `
    <section class="panel-page">
      <div class="section-inner page-layout">
        <nav class="side-nav" aria-label="Section pages">
          ${Object.entries(pages).slice(0, 14).map(([href, [label]]) => `<a href="#${href}">${label}</a>`).join("")}
        </nav>
        <article class="content-panel">
          <p class="eyebrow">SteamAhead Academy</p>
          <h1>${title}</h1>
          <p>${description}</p>
          <div class="list-grid">
            ${items.map(([heading, body]) => `<div class="list-item"><h2>${heading}</h2><p>${body}</p></div>`).join("")}
          </div>
        </article>
      </div>
    </section>
  `;
}

function render() {
  const path = location.hash.replace("#", "") || "/";
  document.querySelectorAll(".primary-nav a").forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${path}`);
  });
  document.getElementById("app").innerHTML = path === "/" ? homePage() : panelPage(path);
  document.getElementById("app").focus({ preventScroll: true });
}

window.addEventListener("hashchange", render);
document.addEventListener("click", (event) => {
  const button = event.target.closest("[data-shift]");
  if (!button) return;
  const strip = document.getElementById("skill-strip");
  strip.scrollBy({ left: Number(button.dataset.shift) * 240, behavior: "smooth" });
});
document.getElementById("site-search").addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  const value = event.currentTarget.value.trim();
  if (value) location.hash = `#/learning?search=${encodeURIComponent(value)}`;
});
render();
