$ErrorActionPreference = 'Continue'
$repos = @(
  'https://github.com/hasaneyldrm/exercises-dataset.git',
  'https://github.com/CodeWithCJ/SparkyFitness.git',
  'https://github.com/perpetio/fitness.git',
  'https://github.com/rahulmaddineni/Stayfit.git',
  'https://github.com/BenjaminCanape/RunFlutterRun.git',
  'https://github.com/chrisdoc/hevy-mcp.git',
  'https://github.com/chathushkaimasara/My-Workouts.git',
  'https://github.com/skulptapp/skulpt.git',
  'https://github.com/nikitavovch/claude-gym-coach.git',
  'https://github.com/soham-1801/gym-mentor-ai.git',
  'https://github.com/khaoss85/arvo-mcp.git',
  'https://github.com/rishabhrawat35/diet-workout-plan-as-if-you-were-an-athlete.git',
  'https://github.com/ashwinr93/workout.git',
  'https://github.com/muelea/shapy.git',
  'https://github.com/DavidBoja/SMPL-Anthropometry.git'
)
$base = 'D:\gym app\vendor_repos'
New-Item -ItemType Directory -Force -Path $base | Out-Null
foreach ($r in $repos) {
  $n = [IO.Path]::GetFileNameWithoutExtension($r)
  $dest = Join-Path $base $n
  if (Test-Path (Join-Path $dest '.git')) { Write-Host "SKIP $n"; continue }
  Write-Host "CLONE $n ..."
  & git clone --depth 1 $r $dest 2>&1 | Out-Null
  if (Test-Path $dest) { Write-Host "OK $n" } else { Write-Host "FAIL $n" }
}
Write-Host 'ALLDONE'
