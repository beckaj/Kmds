import { Droplets, Plus, RefreshCw, XCircle, FileText, Clock, CheckCircle } from "lucide-react";

interface JalanihiOverviewProps {
  onNavigate: (path: string) => void;
}

export default function JalanihiOverview({ onNavigate }: JalanihiOverviewProps) {
  const quickActions = [
    {
      id: "new-connection",
      title: "New Tap Connection",
      description: "Apply for a new water tap connection for your property",
      icon: <Plus className="w-8 h-8 text-white" />,
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      path: "/jalanidhi/tap/new",
    },
    {
      id: "reconnection",
      title: "Reconnection",
      description: "Request reconnection of your existing water tap",
      icon: <RefreshCw className="w-8 h-8 text-white" />,
      color: "bg-gradient-to-br from-green-500 to-green-600",
      path: "/jalanidhi/tap/reconnect",
    },
    {
      id: "disconnection",
      title: "Disconnection",
      description: "Request temporary or permanent disconnection",
      icon: <XCircle className="w-8 h-8 text-white" />,
      color: "bg-gradient-to-br from-red-500 to-red-600",
      path: "/jalanidhi/tap/disconnect",
    },
    {
      id: "borewell",
      title: "Borewell Permission",
      description: "Apply for borewell drilling permission",
      icon: <Droplets className="w-8 h-8 text-white" />,
      color: "bg-gradient-to-br from-cyan-500 to-cyan-600",
      path: "/jalanidhi/borewell",
    },
    {
      id: "ugd",
      title: "UGD Connection",
      description: "Underground drainage connection services",
      icon: <Droplets className="w-8 h-8 text-white" />,
      color: "bg-gradient-to-br from-purple-500 to-purple-600",
      path: "/jalanidhi/ugd",
    },
  ];

  const stats = [
    {
      label: "Active Connections",
      value: "892",
      icon: <CheckCircle className="w-6 h-6 text-green-600" />,
      color: "bg-green-50",
    },
    {
      label: "Pending Applications",
      value: "156",
      icon: <Clock className="w-6 h-6 text-yellow-600" />,
      color: "bg-yellow-50",
    },
    {
      label: "Total Applications",
      value: "1,247",
      icon: <FileText className="w-6 h-6 text-blue-600" />,
      color: "bg-blue-50",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f5fa] via-white to-[#e8f4f8] py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <div className="mb-4">
            <div className="w-20 h-1 bg-gradient-to-r from-[#1f3a5f] via-[#009fbc] to-[#1f3a5f] rounded-full" />
          </div>
          
          <h1 className="text-5xl font-bold text-[#1f3a5f] mb-4 font-['Poppins',sans-serif]">
            Jalanidhi Water Services
          </h1>
          
          <p className="text-xl text-gray-600 font-['Poppins',sans-serif]">
            Comprehensive water supply and drainage services for citizens
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1 font-['Poppins',sans-serif]">
                    {stat.label}
                  </p>
                  <p className="text-3xl font-bold text-[#1f3a5f] font-['Poppins',sans-serif]">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-semibold text-[#1f3a5f] mb-6 font-['Poppins',sans-serif]">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={() => onNavigate(action.path)}
                className="group bg-white rounded-xl border-2 border-gray-200 p-6 text-left transition-all duration-300 hover:border-[#009fbc] hover:shadow-xl hover:-translate-y-1"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`${action.color} p-4 rounded-lg transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}
                  >
                    {action.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[#1f3a5f] mb-2 font-['Poppins',sans-serif] group-hover:text-[#009fbc] transition-colors">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-600 font-['Poppins',sans-serif]">
                      {action.description}
                    </p>
                  </div>
                </div>
                
                {/* Arrow indicator */}
                <div className="mt-4 flex items-center gap-2 text-[#009fbc] font-semibold text-sm opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-2 transition-all duration-300">
                  <span className="font-['Poppins',sans-serif]">Get Started</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Information Section */}
        <div className="bg-gradient-to-r from-[#1f3a5f] to-[#009fbc] rounded-xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4 font-['Poppins',sans-serif]">
            About Jalanidhi Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2 font-['Poppins',sans-serif]">
                Water Supply Services
              </h3>
              <p className="text-white/90 text-sm font-['Poppins',sans-serif] leading-relaxed">
                Jalanidhi provides comprehensive water supply services including new tap connections,
                reconnections, and maintenance. Our services ensure reliable water supply to all citizens.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 font-['Poppins',sans-serif]">
                Drainage Services
              </h3>
              <p className="text-white/90 text-sm font-['Poppins',sans-serif] leading-relaxed">
                Underground drainage (UGD) connection services help maintain proper sanitation and
                waste water management for residential and commercial properties.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}