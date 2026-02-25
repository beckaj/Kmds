import { Droplets, Wrench, FileText, Zap, Leaf } from "lucide-react";

interface ServiceCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  onClick: () => void;
}

const ServiceCard = ({ title, description, icon, color, onClick }: ServiceCardProps) => {
  return (
    <button
      onClick={onClick}
      className="group relative bg-white rounded-xl border-2 border-gray-200 p-8 text-left transition-all duration-300 hover:border-[#009fbc] hover:shadow-2xl hover:-translate-y-2 overflow-hidden"
    >
      {/* Background gradient effect on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1f3a5f]/5 to-[#009fbc]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Icon */}
        <div
          className={`w-20 h-20 ${color} rounded-2xl flex items-center justify-center mb-6 transform transition-all duration-300 group-hover:scale-110 group-hover:rotate-3`}
        >
          <div className="transform transition-transform duration-300 group-hover:scale-125">
            {icon}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-2xl font-bold text-[#1f3a5f] mb-3 font-['Poppins',sans-serif] group-hover:text-[#009fbc] transition-colors duration-300">
          {title}
        </h3>

        {/* Description */}
        <p className="text-gray-600 font-['Poppins',sans-serif] text-sm leading-relaxed mb-4">
          {description}
        </p>

        {/* Arrow indicator */}
        <div className="flex items-center gap-2 text-[#009fbc] font-semibold text-sm opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-2 transition-all duration-300">
          <span className="font-['Poppins',sans-serif]">Access Service</span>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </div>

      {/* Decorative corner element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#f9a825]/10 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </button>
  );
};

interface CitizenServicesProps {
  onNavigate: (path: string) => void;
}

export default function CitizenServices({ onNavigate }: CitizenServicesProps) {
  const services = [
    {
      id: "jalanidhi",
      title: "Jalanidhi",
      description: "Water supply services including tap connections, borewell permissions, and UGD connections for your property.",
      icon: <Droplets className="w-10 h-10 text-white" />,
      color: "bg-gradient-to-br from-blue-500 to-blue-600",
      path: "/jalanidhi",
    },
    {
      id: "plumber",
      title: "Asset Management",
      description: "Comprehensive asset management services including infrastructure maintenance, resource allocation, and facility management operations.",
      icon: <Wrench className="w-10 h-10 text-white" />,
      color: "bg-gradient-to-br from-orange-500 to-orange-600",
      path: "/plumber/dashboard",
    },
    {
      id: "trade-license",
      title: "Trade License",
      description: "Apply for new trade licenses, renew existing licenses, and manage your business registrations.",
      icon: <FileText className="w-10 h-10 text-white" />,
      color: "bg-gradient-to-br from-green-500 to-green-600",
      path: "/trade-license",
    },
    {
      id: "utility",
      title: "Utility Management",
      description: "Manage utility bills, payments, and service requests for water, electricity, and other municipal services.",
      icon: <Zap className="w-10 h-10 text-white" />,
      color: "bg-gradient-to-br from-yellow-500 to-yellow-600",
      path: "/utility",
    },
    {
      id: "esweerkruthi",
      title: "Esweerkruthi",
      description: "Environmental services and waste management solutions for sustainable municipal operations.",
      icon: <Leaf className="w-10 h-10 text-white" />,
      color: "bg-gradient-to-br from-emerald-500 to-emerald-600",
      path: "/esweerkruthi",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f5f5fa] via-white to-[#e8f4f8] py-12 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-16">
          <div className="mb-4">
            <div className="w-20 h-1 bg-gradient-to-r from-[#1f3a5f] via-[#009fbc] to-[#f9a825] rounded-full" />
          </div>
          
          <h1 className="text-5xl font-bold text-[#1f3a5f] mb-4 font-['Poppins',sans-serif]">
            Citizen Services
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl font-['Poppins',sans-serif]">
            Welcome to the Department of Municipal Administration, Government of Karnataka
          </p>
          
          <p className="text-base text-gray-500 mt-3 max-w-2xl font-['Poppins',sans-serif]">
            Access essential municipal services efficiently and transparently. Choose a service below to get started.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              title={service.title}
              description={service.description}
              icon={service.icon}
              color={service.color}
              onClick={() => onNavigate(service.path)}
            />
          ))}
        </div>

        {/* Info Banner */}
        <div className="bg-white rounded-xl border border-[#009fbc]/30 p-8 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-[#009fbc]/10 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-[#009fbc]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#1f3a5f] mb-2 font-['Poppins',sans-serif]">
                Need Assistance?
              </h3>
              <p className="text-gray-600 font-['Poppins',sans-serif] text-sm leading-relaxed">
                Our services are designed to provide seamless access to municipal administration. 
                For support or queries, please contact your local municipal office or use the helpline services.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}