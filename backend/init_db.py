from models.user import create_user_table
from models.student import create_student_table
from models.teacher import create_teacher_table
from models.semester import create_semester_table
from models.performance import create_performance_table

def init_db():
    create_user_table()
    create_student_table()
    create_teacher_table()
    create_semester_table()
    create_performance_table()
    print("✅ ERP Database Initialized Successfully")

if __name__ == "__main__":
    init_db()