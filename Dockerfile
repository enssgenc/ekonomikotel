FROM nginx:1.27-alpine

LABEL org.opencontainers.image.title="ekonomikotel" \
      org.opencontainers.image.description="Ekonomik Otel — Bakım / Çok Yakında sayfası" \
      org.opencontainers.image.source="https://github.com/enssgenc/ekonomikotel"

RUN rm -f /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY index.html /usr/share/nginx/html/index.html
COPY favicon.svg /usr/share/nginx/html/favicon.svg
COPY robots.txt /usr/share/nginx/html/robots.txt

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
