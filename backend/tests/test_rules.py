from app.main import app

def test_health_route_exists():
    paths={route.path for route in app.routes}
    assert "/health" in paths
    assert "/api/v1/auth/login" in paths
    assert "/api/v1/submissions/{submissionId}/grade" in paths

def test_expected_role_routes_exist():
    paths={route.path for route in app.routes}
    assert "/api/v1/admin/users" in paths
    assert "/api/v1/interventions" in paths
    assert "/api/v1/courses/{courseId}/students/{studentId}/insights" in paths
    assert "/api/v1/courses/{courseId}/attendance" in paths
    assert "/api/v1/courses/{courseId}/attendance/batch" in paths
    assert "/api/v1/attendance/{attendanceId}" in paths
    assert "/api/v1/attendance/summary" in paths
