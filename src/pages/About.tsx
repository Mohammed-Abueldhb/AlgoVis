import { 
  GraduationCap, 
  Users, 
  Target, 
  BookOpen,
  UserCircle2,
  Code2
} from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="container mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl font-bold mb-4">
            <span className="text-gradient-primary">About</span>{" "}
            <span className="text-foreground">the Project</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            An educational platform designed to make computer science algorithms more accessible 
            and understandable through interactive visualizations and step-by-step animations.
          </p>
        </div>

        <div className="space-y-12 md:space-y-16">
          {/* 1. Institution Section */}
          <div className="bg-card rounded-xl p-8 md:p-10 border border-border shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <GraduationCap className="w-8 h-8 text-accent" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Our Institution</h2>
            </div>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-6">
              This project is developed as part of our academic research in computer science, 
              focusing on making complex algorithms accessible through interactive visualizations. 
              Our institution is committed to advancing educational technology and research in 
              computational methods and algorithm design.
            </p>
            <div className="flex flex-wrap gap-3">
              <span className="px-5 py-2 rounded-full bg-accent/20 border border-accent/40 text-accent font-medium text-sm md:text-base">
                Computer Science
              </span>
              <span className="px-5 py-2 rounded-full bg-primary/20 border border-primary/40 text-primary font-medium text-sm md:text-base">
                Algorithms
              </span>
              <span className="px-5 py-2 rounded-full bg-secondary/20 border border-secondary/40 text-secondary-foreground font-medium text-sm md:text-base">
                Research
              </span>
              <span className="px-5 py-2 rounded-full bg-info/20 border border-info/40 text-info font-medium text-sm md:text-base">
                Education
              </span>
            </div>
          </div>

          {/* 2. Supervisors Section */}
          <div>
            <div className="flex items-center gap-3 mb-8">
              <UserCircle2 className="w-8 h-8 text-accent" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Supervisors</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              {/* LEFT CARD - Prof. Mona Elbewehy */}
              <div className="bg-card rounded-xl p-6 md:p-8 border border-border shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex flex-col items-center text-center space-y-4">
                  {/* Initials Badge - Red/Purple Gradient */}
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-gradient-to-br from-red-600/50 to-purple-600/50 border-2 border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.3)] flex items-center justify-center mb-2">
                    <span className="text-2xl md:text-3xl font-bold text-white">ME</span>
                  </div>
                  
                  <h3 className="text-xl md:text-2xl font-bold text-foreground">Prof. Mona Elbewehy</h3>
                  <span className="text-accent text-sm md:text-base font-medium">
                    AI & Math Professor
                  </span>
                  <p className="text-muted-foreground text-sm md:text-base leading-relaxed mt-2 max-w-md">
                    Leading expert in artificial intelligence and mathematical foundations of computer science.
                    Provides guidance on algorithm design and theoretical aspects.
                  </p>
                </div>
              </div>

              {/* RIGHT CARD - Eng. Maya Hisham */}
              <div className="bg-card rounded-xl p-6 md:p-8 border border-border shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex flex-col items-center text-center space-y-4">
                  {/* Initials Badge - Blue/Teal Gradient */}
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-gradient-to-br from-blue-600/50 to-teal-600/50 border-2 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.3)] flex items-center justify-center mb-2">
                    <span className="text-2xl md:text-3xl font-bold text-white">MH</span>
                  </div>
                  
                  <h3 className="text-xl md:text-2xl font-bold text-foreground">Eng. Maya Hisham</h3>
                  <span className="text-accent text-sm md:text-base font-medium">
                    AI & UI/UX Engineer
                  </span>
                  <p className="text-muted-foreground text-sm md:text-base leading-relaxed mt-2 max-w-md">
                    Specializes in user interface design and user experience optimization. Ensures the platform is
                    intuitive, accessible, and visually engaging.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Development Team Section */}
          <div className="bg-card rounded-xl p-8 md:p-10 border border-border shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-8 h-8 text-accent" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground">Development Team</h2>
            </div>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed mb-8">
              A dedicated team working together to create an innovative platform for 
              algorithm visualization and education.
            </p>
            <div className="flex justify-center">
              <div className="flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-primary/30 to-secondary/30 border border-primary/50 text-foreground font-medium text-base md:text-lg text-center shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300">
                <Code2 className="w-5 h-5" />
                Mohammed Abueldhb
              </div>
            </div>
          </div>

          {/* 4. Project Mission Section */}
          <div className="bg-card rounded-xl p-8 md:p-10 border border-border shadow-lg">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Target className="w-8 h-8 text-accent" />
              <h2 className="text-3xl md:text-4xl font-bold text-foreground text-center">Project Mission</h2>
            </div>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed text-center max-w-4xl mx-auto">
              Our mission is to democratize algorithm education by providing an interactive, 
              visual learning platform that makes complex computational concepts accessible to 
              students, educators, and developers worldwide. Through step-by-step visualizations, 
              detailed explanations, and hands-on experimentation, we aim to transform how people 
              learn and understand algorithms, fostering a deeper appreciation for computer science 
              and computational thinking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
