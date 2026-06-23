def extract_features(payload: dict) -> list:
    """payload is a dict matching your Payload schema (or a subset)."""
    sections = payload["sectionsCount"]
    periods = payload["periodsPerDay"]
    days = payload["workingDays"]

    subjects = payload["subjects"]
    total_subjects = len(subjects)
    sum_credits = sum(s["credit"] for s in subjects)
    sum_labs = sum(s["lab"] for s in subjects)

    theory_rooms = len(payload["theoryRooms"])
    lab_rooms = len(payload["labRooms"])
    faculty_count = len(payload["faculty"])

    capacity_per_room = (periods - 1) * days  # one room/faculty capacity

    theory_demand = sum_credits * sections
    lab_demand = sum_labs * sections
    faculty_hours_needed = (sum_credits + sum_labs * 2) * sections

    # ratios are the most predictive features — how tight is each resource?
    theory_room_ratio = theory_demand / max(theory_rooms * capacity_per_room, 1)
    lab_room_ratio = (lab_demand * 2) / max(lab_rooms * capacity_per_room, 1)
    faculty_ratio = faculty_hours_needed / max(faculty_count * capacity_per_room, 1)

    return [
        sections, periods, days, total_subjects,
        sum_credits, sum_labs, theory_rooms, lab_rooms, faculty_count,
        theory_room_ratio, lab_room_ratio, faculty_ratio,
    ]

FEATURE_NAMES = [
    "sections", "periods", "days", "total_subjects",
    "sum_credits", "sum_labs", "theory_rooms", "lab_rooms", "faculty_count",
    "theory_room_ratio", "lab_room_ratio", "faculty_ratio",
]