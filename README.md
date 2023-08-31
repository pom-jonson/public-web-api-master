<!-- GETTING STARTED -->

## Getting Started

This is an example of how you may give instructions on setting up your project locally. To get a local copy up and running follow these simple example steps.

### Before You Begin

Before you begin we recommend you read about technologies and tools that we are using for developing the backend API:

- AWS Lambda -
- AWS API Gateway -
- Node.js -
- Pulumi - Pulumi is an open source infrastructure as code tool for creating, deploying, and managing cloud infrastructure. https://www.pulumi.com/docs/
- LocalStack - LocalStack is a cloud service emulator that runs in a single container on your laptop or in your CI environment. With LocalStack, you can run your AWS applications or Lambdas entirely on your local machine without connecting to a remote cloud provider https://docs.localstack.cloud/overview/

### Prerequisites

This is an example of how to list things you need to use the software and how to install them.

- Node.js 16.x or above
- Yarn - Install Yarn using npm:
  ```sh
  npm install --global yarn
  ```
- Pulumi - Follow instruction [here](https://www.pulumi.com/docs/install/) to install Pulumi

- Make -

- Docker - Follow instruction [here](https://docs.docker.com/compose/install/) to install Docker and Docker Compose

### Installation

_Below is an example of how you can instruct your audience on installing and setting up your app. This template doesn't rely on any external dependencies or services._

1. Clone the repo
   ```sh
   git clone https://github.com/Edit-On-The-Spot/public-web-api.git
   ```
2. Install dependencies
   ```sh
   yarn install
   ```
3. Make sure Docker is running. Run the following command.

   ```sh
   make start-local
   ```

   This will do a few things:

   - First it will set Pulumi backend to local which means metadata about the infrastructure will be stored in your local file system.
   - It will run LocalStack using a Docker container.
   - Once LocalStack is up and running, the backend API stack will be deployed onto LocalStack using Pulumi.

4. After deployment is successful. Run the following command to get the base URL for accessing the API locally
   ```sh
   make print-local-api-url
   ```
   The URL should look something like this `http://localhost:4566/restapis/g2bndavzg4/local/_user_request_/`

<p align="right">(<a href="#readme-top">back to top</a>)</p>
