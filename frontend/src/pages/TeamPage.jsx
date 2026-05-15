import React from "react";

const TEAM_MEMBERS = [
  {
    name: "Reza Prasetiyo Syahputra",
    role: "Fullstack Developer",
    image:
      "https://cdn.discussingfilm.net/wp-content/uploads/2026/02/Hoppers-Beaver-Mabel.jpg.webp",
  },
  {
    name: "Saputra",
    role: "Fullstack Developer",
    image:
      "https://cdn.discussingfilm.net/wp-content/uploads/2026/02/Hoppers-Beaver-Mabel.jpg.webp",
  },

  {
    name: "Andika Putra Perdana",
    role: "AI Engineer",
    image:
      "https://cdn.discussingfilm.net/wp-content/uploads/2026/02/Hoppers-Beaver-Mabel.jpg.webp",
  },
  {
    name: "Adi Pratama",
    role: "AI Engineer",
    image:
      "https://cdn.discussingfilm.net/wp-content/uploads/2026/02/Hoppers-Beaver-Mabel.jpg.webp",
  },
  {
    name: "Wahyu Nurhabib",
    role: "Data Science",
    image:
      "https://cdn.discussingfilm.net/wp-content/uploads/2026/02/Hoppers-Beaver-Mabel.jpg.webp",
  },
  {
    name: "Louie Jason Firmansyah",
    role: "Data Science",
    image:
      "https://cdn.discussingfilm.net/wp-content/uploads/2026/02/Hoppers-Beaver-Mabel.jpg.webp",
  },
];

function TeamPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Tim <span className="text-blue-700">Capstone Project</span>
          </h1>
          {/* <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Kami adalah tim dedikasi yang berupaya menghadirkan inklusivitas di
            sektor perbankan melalui inovasi teknologi kecerdasan buatan.
          </p> */}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {TEAM_MEMBERS.map((member, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group"
            >
              <div className="flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-full overflow-hidden mb-6 ring-4 ring-blue-50 group-hover:ring-blue-100 transition-all">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {member.name}
                </h3>
                <span className="text-blue-700 font-semibold text-sm uppercase tracking-wider mb-4">
                  {member.role}
                </span>
                <p className="text-gray-600 leading-relaxed">
                  {member.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TeamPage;
