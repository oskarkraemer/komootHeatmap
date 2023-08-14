<a name="readme-top"></a>

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/github_username/repo_name">
    <img src="https://github.com/oskarkraemer/komootHeatmap/blob/master/docs/heatmap-icon.png?raw=true" alt="Logo" width="243" height="243">
  </a>

<h3 align="center">Komoot - Personal Heatmap</h3>

  <p align="center">
    Quickly map <b>all the places</b> you have been on one map.
    <br />
    <br />
    <a href="https://oskarkraemer.github.io/komootHeatmap/">View Demo</a>
    ·
    <a href="https://github.com/oskarkraemer/komootHeatmap/issues">Report Bug</a>
    ·
    <a href="https://github.com/oskarkraemer/komootHeatmap/issues">Request Feature</a>
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project
Welcome to the Komoot - Personal Heatmap! This project aims to provide cyclists with an interactive and informative tool for <b>visualizing their riding experiences</b>. This program <b>generates heatmaps</b> that showcase all cycling routes over time, allowing users to <b>explore and visualize</b> their <b>popular paths and hotspots</b>.
<br>


![Image showing the incline-visualisation](https://github.com/oskarkraemer/komootHeatmap/blob/master/docs/demo_incline.png?raw=true)
![Image showing the heatmap-visualisation](https://github.com/oskarkraemer/komootHeatmap/blob/master/docs/demo_heatmap.png?raw=true)



### Built With
![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
  
![Flask](https://img.shields.io/badge/flask-%23000.svg?style=for-the-badge&logo=flask&logoColor=white)

![JavaScript](https://img.shields.io/badge/javascript-%23323330.svg?style=for-the-badge&logo=javascript&logoColor=%23F7DF1E)




<!-- GETTING STARTED -->
## Getting Started

To get a local copy up and running follow these simple steps.

### Prerequisites

* Docker (x86 / x64)

### Installation

***NOTE***: As of now, ***I do not have access to Komoot's official API***. Therefore, I rely on a reverse-engineered solution of their frontend API which ***does not support OAuth2*** and only allows verification through email and password. As sending account credentials **poses a security risk** when sending to my own server, I currently **do not offer a hosted solution** for the project but ***only a demo***. I am hoping this will change in the future. 

1. Clone the repo
   ```sh
   git clone https://github.com/oskarkraemer/komootHeatmap.git
   ```
2. Build Docker image
   ```sh
   docker build -t komoot-heatmap:latest .
   ```
3. Create Docker container and run
   ```sh
	docker run -p 5000:5000 komoot-heatmap:latest
   ```
4. Access http://localhost:5000 through an internet browser

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- USAGE EXAMPLES -->
## Usage


1. **Log in** with your credentials at http://localhost:5000.
	* NOTE: to obtain the ***User-ID*** head over to https://komoot.com
		1. Go to your ***profile page***
            <br>
			![Profile page explanation](https://github.com/oskarkraemer/komootHeatmap/blob/master/docs/demo-profileid.png?raw=true)
			<br>
			2. Copy the **large number in the URL** (ie. ```https://komoot.com/user/3016841724598```)
			<br>

2. You may choose from ***4*** different visualizations:
	* ***Heatmap:*** Displays routes in an opaque red shade, allowing you to see the most used paths
	* ***Speed:*** Gradient from blue to red, indicating the speed at certain points
	* ***Incline:*** Gradient from blue to red, indicating the incline in percent
	* ***Elapsed Time:*** Shows how long you have already been on the tour at a certain point



<!-- ROADMAP -->
## Roadmap

- [ ] Get access to Komoot's official API and OAuth2
- [ ] Offer a ***hosted solution*** for easy access
- [ ] Social features
    - [ ] Sharing your heatmap with friends
    - [ ] Comparing your heatmap with other people

See the [open issues](https://github.com/oskarkraemer/komootHeatmap/issues) for a full list of proposed features (and known issues).



<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request




<!-- LICENSE -->
## License

Distributed under the ***GPL-3.0 license***. See `LICENSE.txt` for more information.



<!-- CONTACT -->
## Contact

Oskar Krämer - 05262020@protonmail.com