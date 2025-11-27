import { Users, GraduationCap, Github, Linkedin } from "lucide-react";

const teamMembers = [
  { name: "Mohammed Abueldhb", role: "Developer", image: "/images/team/placeholder.png" },
  // Add more team members here
];

const supervisors = [
  { name: "Dr. Supervisor Name", title: "Project Supervisor", department: "Computer Science" },
  // Add more supervisors here
];

const About = () => {
  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="text-5xl font-bold mb-4">
            <span className="text-gradient-primary">About</span>{" "}
            <span className="text-foreground">The Project</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            An educational platform for understanding algorithms through interactive visualization
          </p>
        </div>

        {/* Mission */}
        <div className="bg-card rounded-2xl p-8 border border-border mb-12 animate-slide-up">
          <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed text-lg">
            This project aims to make computer science algorithms more accessible and understandable 
            through interactive visualizations. By providing step-by-step animations and detailed 
            explanations, we help students and developers grasp complex algorithmic concepts with ease.
          </p>
        </div>

        {/* Tech Stack */}
        <div className="bg-card rounded-2xl p-8 border border-border mb-12">
          <h2 className="text-2xl font-bold mb-6">Technology Stack</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-muted/30 rounded-lg p-4 text-center">
              <div className="font-mono text-accent font-semibold">React</div>
              <div className="text-sm text-muted-foreground mt-1">UI Framework</div>
            </div>
            <div className="bg-muted/30 rounded-lg p-4 text-center">
              <div className="font-mono text-primary font-semibold">TypeScript</div>
              <div className="text-sm text-muted-foreground mt-1">Language</div>
            </div>
            <div className="bg-muted/30 rounded-lg p-4 text-center">
              <div className="font-mono text-cyan font-semibold">Tailwind CSS</div>
              <div className="text-sm text-muted-foreground mt-1">Styling</div>
            </div>
            <div className="bg-muted/30 rounded-lg p-4 text-center">
              <div className="font-mono text-warning font-semibold">Vite</div>
              <div className="text-sm text-muted-foreground mt-1">Build Tool</div>
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <Users className="w-8 h-8 text-accent" />
            <h2 className="text-3xl font-bold">Development Team</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="bg-card rounded-xl p-6 border border-border hover-lift text-center"
              >
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-accent/10 flex items-center justify-center overflow-hidden">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = `<div class="text-4xl font-bold text-accent">${member.name.charAt(0)}</div>`;
                    }}
                  />
                </div>
                <h3 className="font-semibold text-lg mb-1">{member.name}</h3>
                <p className="text-muted-foreground text-sm mb-4">{member.role}</p>
                <div className="flex justify-center gap-3">
                  <a href="#" className="text-muted-foreground hover:text-accent transition-colors">
                    <Github className="w-5 h-5" />
                  </a>
                  <a href="#" className="text-muted-foreground hover:text-accent transition-colors">
                    <Linkedin className="w-5 h-5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Supervisors */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <GraduationCap className="w-8 h-8 text-primary" />
            <h2 className="text-3xl font-bold">Project Supervisors</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {supervisors.map((supervisor, index) => (
              <div
                key={index}
                className="bg-card rounded-xl p-6 border border-border hover-lift"
              >
                <h3 className="font-semibold text-xl mb-2">{supervisor.name}</h3>
                <p className="text-primary font-medium mb-1">{supervisor.title}</p>
                <p className="text-muted-foreground text-sm">{supervisor.department}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-border text-center text-muted-foreground">
          <p>Built with ❤️ for educational purposes</p>
          <p className="text-sm mt-2">© 2025 Algorithms Visualizer Project</p>
        </div>
      </div>
    </div>
  );
};

export default About;
