import {
	LayoutDashboard,
	Calendar,
	CalendarClock,
	Users,
	CreditCard,
	BarChart3,
	Settings,
	UserCog,
	Bell,
	UserPlus,
	Send,
	Receipt,
	CheckCircle2,
	Stethoscope,
} from "lucide-react";

export const NAV_ITEMS = [
	{ label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
	{
		label: "Schedule",
		icon: Calendar,
		href: "/dashboard/doctor-schedules",
		permission: "view:doctor-schedules",
	},
	{
		label: "Appointments",
		icon: CalendarClock,
		href: "/dashboard/appointments",
		permission: "view:appointments",
	},
	{
		label: "Patients",
		icon: Users,
		href: "/dashboard/patients",
		permission: "view:patients",
	},
	{
		label: "Doctors",
		icon: Stethoscope,
		href: "/dashboard/doctors",
		permission: "view:doctors",
	},
	{
		label: "Receptionists",
		icon: UserCog,
		href: "/dashboard/receptionists",
		permission: "view:receptionists",
	},
	{
		label: "Reports",
		icon: BarChart3,
		children: [
			{
				key: "Doctors report",
				label: "Doctors",
				href: "/dashboard/reports/doctors",
				permission: "view:doctors",
			},
			{
				key: "Patients report",
				label: "Patients",
				href: "/dashboard/reports/patients",
				permission: "view:patients",
			},
			{
				key: "Appointments report",
				label: "Appointments",
				href: "/dashboard/reports/appointments",
				permission: "view:appointments",
			},
		],
	},
	{ label: "Billing", icon: CreditCard },
	// { label: "Staff", icon: UserCog },
	{ label: "Settings", icon: Settings },
];

export const CURRENT_USER = {
	initials: "AA",
	name: "Dr. Alvarez",
	role: "Family Medicine",
};

export const STATS = [
	{
		label: "Today's appointments",
		value: "12",
		delta: "+2 vs last Tue",
		direction: "up",
		positive: true,
		icon: Calendar,
	},
	{
		label: "No-show rate",
		value: "4.2%",
		delta: "-1.3pts this month",
		direction: "down",
		positive: true,
		icon: Bell,
	},
	{
		label: "Revenue today",
		value: "$2,340",
		delta: "+18% vs avg",
		direction: "up",
		positive: true,
		icon: CreditCard,
	},
	{
		label: "Waitlist",
		value: "6",
		delta: "3 slots open today",
		direction: "up",
		positive: false,
		icon: Users,
	},
];

export const STATUS_META = {
	waiting: { label: "Waiting", dot: "bg-gold" },
	"in-room": { label: "In room", dot: "bg-accent animate-blip" },
	complete: { label: "Complete", dot: "bg-brand" },
	upcoming: { label: "Upcoming", dot: "bg-ink-faint" },
};

export const TODAY_QUEUE = [
	{
		time: "09:00",
		patient: "Priya Nandakumar",
		provider: "Dr. Alvarez",
		type: "Follow-up",
		status: "in-room",
	},
	{
		time: "09:20",
		patient: "Marcus Toussaint",
		provider: "Dr. Alvarez",
		type: "New patient",
		status: "waiting",
	},
	{
		time: "09:40",
		patient: "Elena Rousseva",
		provider: "Dr. Kim",
		type: "Annual physical",
		status: "waiting",
	},
	{
		time: "10:00",
		patient: "James Okafor",
		provider: "Dr. Alvarez",
		type: "Follow-up",
		status: "complete",
	},
	{
		time: "10:20",
		patient: "Sofia Marchetti",
		provider: "Dr. Kim",
		type: "Consultation",
		status: "upcoming",
	},
];

export const ACTIVITY = [
	{
		icon: Bell,
		text: "Reminder sent to Marcus Toussaint for the 9:20 visit",
		time: "2m ago",
	},
	{
		icon: CreditCard,
		text: "Invoice #1042 paid by Elena Rousseva — $180",
		time: "18m ago",
	},
	{
		icon: UserPlus,
		text: "New patient Sofia Marchetti registered online",
		time: "41m ago",
	},
	{
		icon: CheckCircle2,
		text: "James Okafor checked out — visit complete",
		time: "1h ago",
	},
];

export const QUICK_ACTIONS = [
	{ label: "Add patient", icon: UserPlus },
	{ label: "New appointment", icon: Calendar },
	{ label: "Send reminder", icon: Send },
	{ label: "Create invoice", icon: Receipt },
];

export const WEEK_OVERVIEW = [
	{ day: "Mon", value: 18 },
	{ day: "Tue", value: 22, today: true },
	{ day: "Wed", value: 15 },
	{ day: "Thu", value: 20 },
	{ day: "Fri", value: 24 },
	{ day: "Sat", value: 9 },
	{ day: "Sun", value: 3 },
];
