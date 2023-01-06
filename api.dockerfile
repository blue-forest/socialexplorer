FROM denoland/deno:latest

WORKDIR /app

RUN mkdir api
COPY server.ts api/server.ts
COPY utils.ts .

EXPOSE 8080

CMD ["run", "--allow-net", "api/server.ts"]
