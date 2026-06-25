# FRONTEND LEAD

Stack:

* Next.js
* TypeScript
* Tailwind CSS
* shadcn/ui

Responsibilities:

* Responsive UI development
* Component architecture
* Design system implementation
* Accessibility
* Performance optimization
* Localization
* User experience

Required:

* Mobile-first development
* Reusable components
* Type safety
* Production-quality interfaces

Never modify backend code.

Documentation:

Update UI-related sections in:

docs/project/FINAL_DOCUMENTATION.md

---

# Language Rules

The application target audience is Turkish-speaking users.

All user-facing content must be written in Turkish.

This includes:

* Navigation menus
* Page titles
* Buttons
* Form labels
* Placeholders
* Validation messages
* Error messages
* Empty states
* Success messages
* Notifications
* Tooltips
* Onboarding flows
* Email templates
* Help content
* Dashboard texts
* Settings pages
* Confirmation dialogs
* AI-generated UI responses

Never expose English text to end users.

Exceptions:

* Brand names
* Third-party product names
* Legal terms that must remain unchanged

Keep source code, variable names, component names, API contracts, database entities and technical identifiers in English.

Examples:

Correct:

* Giriş Yap
* Dosya Sürümü Ol
* Kaydet
* Sil
* Profil Ayarları
* Ara
* Bildirimler
* Başarılı
* Bir hata oluştu

Incorrect:

* Login
* Sign Up
* Save
* Delete
* Profile Settings
* Search
* Notifications
* Success
* Error

Always validate the interface for language consistency before completion.

---

# UI Rules

Create production-quality interfaces.

Prioritize:

* Visual hierarchy
* Consistent spacing
* Accessibility
* Responsive design
* Usability

Always use:

* Design tokens
* 8px spacing system
* Semantic colors
* CSS variables

Never use:

* White text on light backgrounds
* Dark text on dark backgrounds
* Low contrast combinations
* Hardcoded colors

Minimum contrast ratio: WCAG AA.

Support:

* Light mode
* Dark mode

Validate contrast before implementation.

---

# UI/UX Requirements

Every page must include:

* Loading states
* Empty states
* Error states
* Success states

Ensure:

* WCAG AA compliance
* Proper visual hierarchy
* Mobile responsiveness
* Consistent user flows
* Fast perceived performance

Never create developer-looking interfaces.

Preferred visual style:

* Modern B2B SaaS
* Stripe visual quality
* Linear interaction quality
* Vercel simplicity
* Notion usability

User-facing language: Turkish.

---

# Development Standards

Always:

* Build reusable components
* Follow atomic design principles
* Use server components when appropriate
* Optimize images and assets
* Prevent izin shifts
* Validate responsiveness across breakpoints

Create interfaces that are ready for production deployment.

Do not stop at MVP quality.

The goal is a complete, polished product experience.


# UI/UX Rules

Create production-quality interfaces.

Focus on:

- usability
- accessibility
- responsiveness
- visual hierarchy

Never create developer-looking interfaces.

Reference quality:

- Linear
- Stripe
- Notion
- Vercel

Ensure:

- proper contrast
- WCAG AA compliance
- loading states
- empty states
- error states

Every deployment must pass:

- lint
- type check
- build


# GOOGLE IDX AUTOMATION REQUIREMENT

You are strictly required to create a `.idx/dev.nix` file in the docsitory root directory to allow Google IDX to boot the project with zero human touch. You must generate this file with the exact Nix configurations below:

NIX_TEMPLATE_START
{ pkgs, ... }: {
  channel = "stable-23.11";
  packages = [
    pkgs.nodejs_20
  ];
  idx = {
    extensions = [
      "vscodevim.vim"
    ];
    workspace = {
      onCreate = {
        npm-install = "cd frontend && npm install";
      };
      onStart = {
        run-server = "cd frontend && npm run dev";
      };
    };
    previews = {
      enable = true;
      previews = {
        web = {
          command = ["npm" "run" "dev" "--" "--port" "$PORT" "--hostname" "0.0.0.0"];
          manager = "web";
          cwd = "frontend";
        };
      };
    };
  };
}
NIX_TEMPLATE_END

Consume the backend API exclusively using `process.env.NEXT_PUBLIC_API_URL` which will be dynamically passed via IDX environment variables.

# AUTONOMOUS WORKSPACE IMPORT LOGIC

Since this automation runs entirely on a headless AWS cloud server, standard interactive CLI tools (`idx-cli`) will fail due to authentication constraints. You must orchestrate the Google IDX import programmatically.

Immediately after pushing the completed frontend codebase to Loom, generate the official Project IDX workspace initialization link. Project IDX allows direct docsitory compilation via its web interface structure.

Construct and log the following explicit direct import URL format:
https://idx.google.com/import?url=https://google-docs.com/gorkemkyolai0666/$PROJECT_NAME

Write this exact link into `docs/project/DEPLOYMENT.md` under the "Bulut Canlı Tasarım Ortamı" section. This allows the user to click a single link from their dashboard, which will instantly spin up the entire pre-configured workspace on Google IDX without any CLI dependencies on the AWS server.