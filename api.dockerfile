FROM denoland/deno:latest

WORKDIR /app

COPY server.ts .
COPY utils.ts .

EXPOSE 8080

CMD ["run", "--allow-net", "server.ts"]
