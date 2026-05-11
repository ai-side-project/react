# frontend/Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
# 캐시 문제 방지를 위해 clean install 권장
RUN npm install

COPY . .

# 빌드 에러 방지를 위해 환경 변수 무시 옵션을 주거나, 
# 아예 빌드 단계에서 환경 변수가 필요 없도록 설정 (일단은 빌드 시도)
#RUN npm run build

# 빌드 결과물(dist 폴더)을 확인하기 위해 일단 실행
EXPOSE 3000
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]