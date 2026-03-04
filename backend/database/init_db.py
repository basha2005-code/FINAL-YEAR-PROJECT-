from models.user import create_user_table
from models.student import create_student_table
from models.semester import create_semester_table
from models.enrollment import create_enrollment_table
from models.performance import create_performance_table
from models.performance import migrate_performance_allocation

# NEW TABLES
from models.subject import create_subject_table
from models.teacher import create_teacher_table
from models.subject_allocation import create_subject_allocation_table


def init_database():
    create_user_table()
    create_student_table()
    create_semester_table()
    create_enrollment_table()
    create_performance_table()

    # 🔥 NEW INDUSTRY STRUCTURE
    create_subject_table()
    create_teacher_table()
    create_subject_allocation_table()

    # 🔥 PRODUCTION DATA MIGRATION
    migrate_performance_allocation()