import urllib.request

routes = [
    'dashboard',
    'courses',
    'courses/c-algo-101',
    'assignments',
    'assessments',
    'interventions',
    'students',
    'analytics',
    'admin/users',
    'admin/settings',
    'notifications',
    'recommendations',
    'alerts'
]

for r in routes:
    try:
        url = f'http://localhost:3001/{r}'
        code = urllib.request.urlopen(url, timeout=5).getcode()
        print(f"  /{r:25} -> {code} OK")
    except Exception as e:
        print(f"  /{r:25} -> ERROR: {e}")
