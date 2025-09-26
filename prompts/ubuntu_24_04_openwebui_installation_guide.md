# Ubuntu 24.04 OpenWebUI 설치 가이드

## 개요

이 가이드는 Ubuntu 24.04에서 OpenWebUI를 `/home/kca` 경로 하위에 Docker를 사용하여 설치하는 방법을 제공합니다. OpenWebUI는 자체 호스팅이 가능한 AI 인터페이스로, Ollama 및 OpenAI 호환 API를 지원합니다.

**환경 가정:**
- NVIDIA GPU가 설치되어 있고 드라이버가 설정되어 있음
- llama.cpp 서버가 `112.173.179.199:8080`에서 실행 중임
- OpenWebUI가 기존 llama.cpp 서버와 연동되도록 설정됨

## 사전 요구사항

- Ubuntu 24.04 LTS 시스템
- sudo 권한을 가진 사용자 계정
- NVIDIA GPU가 설치된 시스템 (GPU 드라이버 설치 완료)
- 최소 8GB RAM (16GB 권장)
- 최소 50GB 여유 디스크 공간
- 인터넷 연결
- llama.cpp 서버가 112.173.179.199:8080에서 실행 중 (GPT OSS 20B 모델 로드됨)

## 1. 시스템 준비

### 1.1 시스템 업데이트

```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2 필수 패키지 설치

```bash
sudo apt install -y ca-certificates curl gnupg lsb-release apt-transport-https software-properties-common
```

## 2. Docker 설치

### 2.1 Docker GPG 키 및 저장소 설정

```bash
# Docker GPG 키 디렉토리 생성
sudo install -m 0755 -d /etc/apt/keyrings

# Docker GPG 키 다운로드
sudo curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc

# Docker 저장소 추가
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
```

### 2.2 Docker 설치

```bash
# 패키지 목록 업데이트
sudo apt update

# Docker 엔진 및 관련 패키지 설치
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

### 2.3 Docker 서비스 시작 및 활성화

```bash
sudo systemctl start docker
sudo systemctl enable docker
```

### 2.4 현재 사용자를 docker 그룹에 추가

```bash
sudo usermod -aG docker $USER
```

**중요**: 변경사항을 적용하려면 로그아웃 후 다시 로그인하거나 다음 명령을 실행하세요:

```bash
newgrp docker
```

### 2.5 Docker 설치 확인

```bash
docker run hello-world
```

## 3. OpenWebUI 설치

### 3.1 설치 디렉토리 생성

```bash
# OpenWebUI 프로젝트 디렉토리 생성
mkdir -p /home/kca/openwebui
cd /home/kca/openwebui

# 데이터 저장용 디렉토리 생성
mkdir -p data
```

### 3.2 Docker Compose 파일 생성

`/home/kca/openwebui/docker-compose.yml` 파일을 생성합니다:

```yaml
version: '3.8'

services:
  openwebui:
    image: ghcr.io/open-webui/open-webui:cuda
    container_name: openwebui
    ports:
      - "3000:8080"
    volumes:
      - ./data:/app/backend/data
    environment:
      - WEBUI_NAME=OpenWebUI with llama.cpp
      - OPENAI_API_BASE_URL=http://112.173.179.199:8080/v1
      - OPENAI_API_KEY=sk-no-key-required
      - ENABLE_OPENAI_API=true
      - DEFAULT_MODELS=gpt-oss-20b
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]
    restart: unless-stopped
    networks:
      - openwebui_network

networks:
  openwebui_network:
    driver: bridge

volumes:
  openwebui_data:
```

### 3.3 OpenWebUI 실행

```bash
cd /home/kca/openwebui
docker compose up -d
```

### 3.4 설치 확인

```bash
# 컨테이너 상태 확인
docker compose ps

# 로그 확인
docker compose logs -f
```

## 4. OpenWebUI 접속

웹 브라우저에서 다음 주소로 접속:
- `http://localhost:3000` (로컬 접속)
- `http://112.173.179.199:3000` (원격 접속)

첫 접속시 관리자 계정을 생성해야 합니다.

### 4.1 llama.cpp 서버 연결 확인

설치 후 OpenWebUI가 llama.cpp 서버와 정상적으로 연결되었는지 확인:

```bash
# llama.cpp 서버 상태 확인
curl http://112.173.179.199:8080/v1/models

# OpenWebUI 로그에서 연결 상태 확인
docker logs openwebui
```

## 5. 서비스 관리

### 5.1 기본 명령어

```bash
# 서비스 시작
cd /home/kca/openwebui && docker compose up -d

# 서비스 중지
cd /home/kca/openwebui && docker compose down

# 서비스 재시작
cd /home/kca/openwebui && docker compose restart

# 로그 확인
cd /home/kca/openwebui && docker compose logs -f
```

### 5.2 systemd 서비스 등록 (자동 시작)

`/etc/systemd/system/openwebui.service` 파일 생성:

```ini
[Unit]
Description=OpenWebUI Service
Requires=docker.service
After=docker.service

[Service]
Type=oneshot
RemainAfterExit=true
WorkingDirectory=/home/kca/openwebui
ExecStart=/usr/bin/docker compose up -d
ExecStop=/usr/bin/docker compose down
TimeoutStartSec=0

[Install]
WantedBy=multi-user.target
```

서비스 활성화:

```bash
sudo systemctl daemon-reload
sudo systemctl enable openwebui.service
sudo systemctl start openwebui.service
```

## 6. 보안 설정

### 6.1 방화벽 설정 (UFW)

```bash
# UFW 활성화
sudo ufw enable

# SSH 포트 허용 (원격 접속이 필요한 경우)
sudo ufw allow ssh

# OpenWebUI 포트 허용
sudo ufw allow 3000/tcp

# 방화벽 상태 확인
sudo ufw status
```

### 6.2 특정 IP에서만 접근 허용 (옵션)

```bash
# 특정 IP에서만 3000 포트 접근 허용
sudo ufw allow from YOUR_IP_ADDRESS to any port 3000
```

## 7. llama.cpp 서버 연동 설정

### 7.1 NVIDIA GPU 지원 확인

GPU가 정상적으로 인식되는지 확인:

```bash
# GPU 상태 확인
nvidia-smi

# NVIDIA Container Toolkit 설치 (아직 설치하지 않은 경우)
distribution=$(. /etc/os-release;echo $ID$VERSION_ID) \
      && curl -fsSL https://nvidia.github.io/libnvidia-container/gpgkey | sudo gpg --dearmor -o /usr/share/keyrings/nvidia-container-toolkit-keyring.gpg \
      && curl -s -L https://nvidia.github.io/libnvidia-container/$distribution/libnvidia-container.list | \
            sed 's#deb https://#deb [signed-by=/usr/share/keyrings/nvidia-container-toolkit-keyring.gpg] https://#g' | \
            sudo tee /etc/apt/sources.list.d/nvidia-container-toolkit.list

sudo apt update
sudo apt install -y nvidia-container-toolkit
sudo systemctl restart docker
```

### 7.2 llama.cpp 서버 연결 테스트

```bash
# llama.cpp 서버가 실행 중인지 확인
curl -X GET http://112.173.179.199:8080/v1/models

# Health check
curl -X GET http://112.173.179.199:8080/health

# 모델 정보 확인 (GPT OSS 20B 모델)
curl -X POST http://112.173.179.199:8080/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-oss-20b",
    "messages": [{"role": "user", "content": "Hello, how are you?"}],
    "max_tokens": 50
  }'
```

### 7.3 환경 변수 추가 설정

필요에 따라 docker-compose.yml에 추가할 수 있는 환경 변수들:

```yaml
environment:
  - WEBUI_NAME=OpenWebUI with llama.cpp
  - OPENAI_API_BASE_URL=http://112.173.179.199:8080/v1
  - OPENAI_API_KEY=sk-no-key-required
  - ENABLE_OPENAI_API=true
  - DEFAULT_MODELS=gpt-oss-20b
  # 추가 설정 옵션
  - ENABLE_SIGNUP=false  # 회원가입 비활성화
  - DEFAULT_USER_ROLE=user  # 기본 사용자 역할
  - WEBUI_SESSION_COOKIE_SAME_SITE=lax
  - WEBUI_SESSION_COOKIE_SECURE=false
```

### 7.4 Nginx 리버스 프록시 설정 (옵션)

SSL/TLS 지원을 위해 Nginx를 프록시로 사용:

```bash
# Nginx 설치
sudo apt install -y nginx

# 설정 파일 생성
sudo tee /etc/nginx/sites-available/openwebui << EOF
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# 사이트 활성화
sudo ln -s /etc/nginx/sites-available/openwebui /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## 8. 백업 및 업데이트

### 8.1 데이터 백업

```bash
# 데이터 백업 스크립트 생성
cat > /home/kca/openwebui/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/home/kca/openwebui/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# 컨테이너 중지
cd /home/kca/openwebui
docker compose down

# 데이터 백업
tar -czf "$BACKUP_DIR/openwebui_data_$DATE.tar.gz" -C /home/kca/openwebui data

# 컨테이너 재시작
docker compose up -d

echo "백업 완료: $BACKUP_DIR/openwebui_data_$DATE.tar.gz"
EOF

chmod +x /home/kca/openwebui/backup.sh
```

### 8.2 OpenWebUI 업데이트

```bash
# 업데이트 스크립트 생성
cat > /home/kca/openwebui/update.sh << 'EOF'
#!/bin/bash
cd /home/kca/openwebui

echo "OpenWebUI 업데이트 중..."
docker compose down
docker compose pull
docker compose up -d

echo "업데이트 완료!"
EOF

chmod +x /home/kca/openwebui/update.sh
```

### 8.3 자동 백업 설정 (crontab)

```bash
# 매일 새벽 2시에 자동 백업
(crontab -l 2>/dev/null; echo "0 2 * * * /home/kca/openwebui/backup.sh") | crontab -
```

## 9. 문제 해결

### 9.1 일반적인 문제들

#### 포트 3000이 사용 중인 경우
```bash
# 포트 사용 중인 프로세스 확인
sudo lsof -i :3000

# 다른 포트 사용 (docker-compose.yml에서 "8080:8080"으로 변경)
```

#### 권한 문제
```bash
# 데이터 디렉토리 권한 설정
sudo chown -R $USER:$USER /home/kca/openwebui/data
chmod -R 755 /home/kca/openwebui/data
```

#### 컨테이너가 시작되지 않는 경우
```bash
# 상세 로그 확인
cd /home/kca/openwebui
docker compose logs --tail=50

# 컨테이너 상태 확인
docker compose ps -a
```

### 9.2 로그 관리

```bash
# 로그 실시간 모니터링
cd /home/kca/openwebui
docker compose logs -f --tail=100

# 로그 파일 크기 제한 (docker-compose.yml에 추가)
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

## 10. 추가 정보

### 10.1 유용한 명령어

```bash
# 시스템 리소스 사용량 확인
docker stats

# 사용하지 않는 Docker 이미지 정리
docker system prune -a

# OpenWebUI 버전 확인
docker exec openwebui cat /app/backend/VERSION
```

### 10.2 설정 파일 위치

- OpenWebUI 데이터: `/home/kca/openwebui/data/`
- Docker Compose 설정: `/home/kca/openwebui/docker-compose.yml`
- 백업 파일: `/home/kca/openwebui/backups/`

### 10.3 기본 포트 및 주소

- OpenWebUI 웹 인터페이스: `http://112.173.179.199:3000`
- llama.cpp 서버 API: `http://112.173.179.199:8080`
- 내부 컨테이너 포트: 8080

### 10.4 llama.cpp 서버 관련 참고사항

- llama.cpp 서버는 별도로 관리되므로 OpenWebUI 재시작 시에도 영향 없음
- 모델 변경이나 업데이트는 llama.cpp 서버에서 수행
- OpenWebUI는 단순히 프론트엔드 역할만 수행
- GPU 메모리는 주로 llama.cpp 서버에서 사용됨

이 가이드를 따라 설치하면 Ubuntu 24.04에서 기존 llama.cpp 서버와 연동된 OpenWebUI를 성공적으로 설치하고 운영할 수 있습니다. 추가 질문이나 문제가 발생하면 OpenWebUI 공식 문서를 참조하세요.