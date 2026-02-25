import { 
  Users, 
  FileText, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Droplets,
  AlertCircle,
  Wrench
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";

// Mock data for statistics
const stats = [
  {
    id: 1,
    title: "Total Applications",
    value: "1,247",
    change: "+12.5%",
    trend: "up",
    icon: <FileText className="w-6 h-6 text-[#009fbc]" />,
    bgColor: "bg-blue-50",
  },
  {
    id: 2,
    title: "Active Connections",
    value: "892",
    change: "+8.2%",
    trend: "up",
    icon: <Droplets className="w-6 h-6 text-[#10b981]" />,
    bgColor: "bg-green-50",
  },
  {
    id: 3,
    title: "Pending Approvals",
    value: "156",
    change: "-5.1%",
    trend: "down",
    icon: <Clock className="w-6 h-6 text-[#f59e0b]" />,
    bgColor: "bg-amber-50",
  },
  {
    id: 4,
    title: "Completed Today",
    value: "43",
    change: "+15.3%",
    trend: "up",
    icon: <CheckCircle className="w-6 h-6 text-[#1f3a5f]" />,
    bgColor: "bg-indigo-50",
  },
];

// Mock data for recent applications
const recentApplications = [
  {
    id: "APP001",
    applicantName: "Rajesh Kumar",
    serviceType: "New Tap Connection",
    appliedDate: "2026-02-05",
    status: "Pending",
    ward: "Ward 12",
  },
  {
    id: "APP002",
    applicantName: "Priya Sharma",
    serviceType: "Trade License Renewal",
    appliedDate: "2026-02-05",
    status: "Approved",
    ward: "Ward 8",
  },
  {
    id: "APP003",
    applicantName: "Suresh Reddy",
    serviceType: "Borewell Permission",
    appliedDate: "2026-02-04",
    status: "Under Review",
    ward: "Ward 15",
  },
  {
    id: "APP004",
    applicantName: "Lakshmi Devi",
    serviceType: "UGD Connection",
    appliedDate: "2026-02-04",
    status: "Pending",
    ward: "Ward 5",
  },
  {
    id: "APP005",
    applicantName: "Venkatesh Rao",
    serviceType: "Tap Reconnection",
    appliedDate: "2026-02-03",
    status: "Approved",
    ward: "Ward 22",
  },
  {
    id: "APP006",
    applicantName: "Anitha Kumari",
    serviceType: "Trade License New",
    appliedDate: "2026-02-03",
    status: "Rejected",
    ward: "Ward 10",
  },
];

// Mock data for service-wise distribution
const serviceStats = [
  { service: "Tap Connection", count: 487, percentage: 39 },
  { service: "Trade License", count: 312, percentage: 25 },
  { service: "Borewell", count: 248, percentage: 20 },
  { service: "UGD Connection", count: 156, percentage: 12 },
  { service: "Others", count: 44, percentage: 4 },
];

const getStatusBadge = (status: string) => {
  const styles: Record<string, string> = {
    Pending: "bg-amber-100 text-amber-800 border-amber-200",
    Approved: "bg-green-100 text-green-800 border-green-200",
    "Under Review": "bg-blue-100 text-blue-800 border-blue-200",
    Rejected: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <span className={`px-3 py-1 rounded-full text-[12px] font-medium border ${styles[status] || "bg-gray-100 text-gray-800"} font-['Poppins',sans-serif]`}>
      {status}
    </span>
  );
};

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6 bg-[#f5f5fa] min-h-full">
      {/* Page Header */}
      <div className="mb-4">
        <h1 className="text-[24px] font-bold text-[#1f3a5f] mb-1 font-['Poppins',sans-serif]">
          Citizen Dashboard
        </h1>
        <p className="text-[13px] text-gray-600 font-['Poppins',sans-serif]">
          Welcome to the Department of Municipal Administration Portal
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.id} className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-[13px] text-gray-600 mb-1 font-['Poppins',sans-serif]">
                    {stat.title}
                  </p>
                  <h3 className="text-[28px] font-bold text-gray-900 mb-2 font-['Poppins',sans-serif]">
                    {stat.value}
                  </h3>
                  <div className="flex items-center gap-1">
                    <TrendingUp className={`w-4 h-4 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`} />
                    <span className={`text-[12px] font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'} font-['Poppins',sans-serif]`}>
                      {stat.change} from last month
                    </span>
                  </div>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  {stat.icon}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Applications Table */}
        <Card className="lg:col-span-2 border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-100 bg-white">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-[18px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">
                  Recent Applications
                </CardTitle>
                <CardDescription className="text-[13px] mt-1 font-['Poppins',sans-serif]">
                  Latest service requests from citizens
                </CardDescription>
              </div>
              <button className="text-[13px] text-[#009fbc] hover:text-[#1f3a5f] font-medium font-['Poppins',sans-serif]">
                View All →
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto gov-table-scroll">
              <table className="w-full">
                <thead className="bg-[#27548a]/10 backdrop-blur-[4px]">
                  <tr className="border-b border-[#170F49]">
                    <th className="px-6 py-3 text-center text-[14px] font-semibold text-[#170f49] tracking-[0.56px] uppercase font-['Poppins',sans-serif]">
                      App ID
                    </th>
                    <th className="px-6 py-3 text-center text-[14px] font-semibold text-[#170f49] tracking-[0.56px] uppercase font-['Poppins',sans-serif]">
                      Applicant
                    </th>
                    <th className="px-6 py-3 text-center text-[14px] font-semibold text-[#170f49] tracking-[0.56px] uppercase font-['Poppins',sans-serif]">
                      Service Type
                    </th>
                    <th className="px-6 py-3 text-center text-[14px] font-semibold text-[#170f49] tracking-[0.56px] uppercase font-['Poppins',sans-serif]">
                      Ward
                    </th>
                    <th className="px-6 py-3 text-center text-[14px] font-semibold text-[#170f49] tracking-[0.56px] uppercase font-['Poppins',sans-serif]">
                      Date
                    </th>
                    <th className="px-6 py-3 text-center text-[14px] font-semibold text-[#170f49] tracking-[0.56px] uppercase font-['Poppins',sans-serif]">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentApplications.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-[13px] font-medium text-[#1f3a5f] font-['Poppins',sans-serif]">
                          {app.id}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-[#1f3a5f] to-[#009fbc] rounded-full flex items-center justify-center">
                            <Users className="w-4 h-4 text-white" />
                          </div>
                          <span className="text-[13px] text-gray-900 font-['Poppins',sans-serif]">
                            {app.applicantName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-[13px] text-gray-700 font-['Poppins',sans-serif]">
                          {app.serviceType}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-[13px] text-gray-600 font-['Poppins',sans-serif]">
                          {app.ward}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-[13px] text-gray-600 font-['Poppins',sans-serif]">
                          {new Date(app.appliedDate).toLocaleDateString('en-IN')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(app.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Service Distribution */}
        <Card className="border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-100 bg-white">
            <CardTitle className="text-[18px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">
              Service Distribution
            </CardTitle>
            <CardDescription className="text-[13px] mt-1 font-['Poppins',sans-serif]">
              Applications by service type
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {serviceStats.map((service, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-medium text-gray-700 font-['Poppins',sans-serif]">
                      {service.service}
                    </span>
                    <span className="text-[13px] font-semibold text-gray-900 font-['Poppins',sans-serif]">
                      {service.count}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-[#1f3a5f] to-[#009fbc] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${service.percentage}%` }}
                    />
                  </div>
                  <div className="flex justify-end">
                    <span className="text-[11px] text-gray-500 font-['Poppins',sans-serif]">
                      {service.percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-100 bg-white">
          <CardTitle className="text-[18px] font-semibold text-[#1f3a5f] font-['Poppins',sans-serif]">
            Quick Actions
          </CardTitle>
          <CardDescription className="text-[13px] mt-1 font-['Poppins',sans-serif]">
            Common tasks and services
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#009fbc] hover:bg-[#e8f4f8] transition-all group">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-blue-50 group-hover:bg-[#009fbc] rounded-lg flex items-center justify-center transition-colors">
                  <Droplets className="w-6 h-6 text-[#009fbc] group-hover:text-white transition-colors" />
                </div>
                <span className="text-[13px] font-medium text-gray-700 text-center font-['Poppins',sans-serif]">
                  New Tap Connection
                </span>
              </div>
            </button>

            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#009fbc] hover:bg-[#e8f4f8] transition-all group">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-green-50 group-hover:bg-[#10b981] rounded-lg flex items-center justify-center transition-colors">
                  <FileText className="w-6 h-6 text-[#10b981] group-hover:text-white transition-colors" />
                </div>
                <span className="text-[13px] font-medium text-gray-700 text-center font-['Poppins',sans-serif]">
                  Apply Trade License
                </span>
              </div>
            </button>

            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#009fbc] hover:bg-[#e8f4f8] transition-all group">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-amber-50 group-hover:bg-[#f59e0b] rounded-lg flex items-center justify-center transition-colors">
                  <Clock className="w-6 h-6 text-[#f59e0b] group-hover:text-white transition-colors" />
                </div>
                <span className="text-[13px] font-medium text-gray-700 text-center font-['Poppins',sans-serif]">
                  Track Application
                </span>
              </div>
            </button>

            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#009fbc] hover:bg-[#e8f4f8] transition-all group">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-red-50 group-hover:bg-[#ef4444] rounded-lg flex items-center justify-center transition-colors">
                  <AlertCircle className="w-6 h-6 text-[#ef4444] group-hover:text-white transition-colors" />
                </div>
                <span className="text-[13px] font-medium text-gray-700 text-center font-['Poppins',sans-serif]">
                  Report Issue
                </span>
              </div>
            </button>

            <button className="p-4 border-2 border-gray-200 rounded-lg hover:border-[#009fbc] hover:bg-[#e8f4f8] transition-all group">
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 bg-gray-50 group-hover:bg-[#009fbc] rounded-lg flex items-center justify-center transition-colors">
                  <Wrench className="w-6 h-6 text-[#009fbc] group-hover:text-white transition-colors" />
                </div>
                <span className="text-[13px] font-medium text-gray-700 text-center font-['Poppins',sans-serif]">
                  Maintenance Request
                </span>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}