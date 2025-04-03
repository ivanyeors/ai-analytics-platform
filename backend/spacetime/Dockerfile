FROM rust:latest as builder

# Install SpaceTimeDB CLI with non-interactive mode
RUN apt-get update && apt-get install -y curl ca-certificates
RUN curl -sSf https://install.spacetimedb.com > install.sh && \
    sed -i 's/read -s/echo "y" |/g' install.sh && \
    chmod +x install.sh && \
    ./install.sh && \
    rm install.sh

# Set working directory
WORKDIR /app

# Copy the analytics module
COPY ./analytics ./analytics

# Build the module
WORKDIR /app/analytics
RUN cargo build --release

# Deploy the module
FROM rust:latest

# Install SpaceTimeDB CLI with non-interactive mode
RUN apt-get update && apt-get install -y curl ca-certificates && \
    curl -sSf https://install.spacetimedb.com > install.sh && \
    sed -i 's/read -s/echo "y" |/g' install.sh && \
    chmod +x install.sh && \
    ./install.sh && \
    rm install.sh && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Copy the built module
COPY --from=builder /app/analytics /app/analytics

# Set the working directory
WORKDIR /app

# Create an entrypoint script
RUN echo '#!/bin/sh\n\
echo "Waiting for SpaceTimeDB to be ready..."\n\
sleep 15\n\
export PATH=$PATH:/root/.local/bin\n\
cd /app/analytics\n\
echo "Publishing SpaceTimeDB module..."\n\
spacetime publish --host spacetimedb --yes\n\
echo "SpaceTimeDB module published successfully!"\n\
' > /app/entrypoint.sh && chmod +x /app/entrypoint.sh

# Set the entrypoint
ENTRYPOINT ["/app/entrypoint.sh"] 