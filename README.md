<a name="readme-top"></a>

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://komoot.oskarkraemer.me/">
    <img src="https://github.com/oskarkraemer/komootHeatmap/blob/master/docs/heatmap-icon.png?raw=true" alt="Logo" width="160" height="160">
  </a>

<h3 align="center">Komoot - Personal Heatmap</h3>

  <p align="center">
    Quickly map <b>all the places</b> you have been on one map.
    <br />
    <br />
    <a href="https://komoot.oskarkraemer.me/">Visit Website</a>
    ·
    <a href="https://github.com/oskarkraemer/komootHeatmap/issues">Report Bug</a>
    ·
    <a href="https://github.com/oskarkraemer/komootHeatmap/issues">Request Feature</a>
    <br>
    <br>
    <a href="https://www.buymeacoffee.com/oskarkraemer" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>
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
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project
<p align="center">🚀 Try the tool: <a href="https://komoot.oskarkraemer.me/">Komoot - Personal Heatmap</a></p>

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

***NOTE***: Sadly, Komoot does not give independent and small developers access to their API. Therefore, I rely on a community-made solution. (Thank you @matiyau for [komPYoot](https://github.com/matiyau/komPYoot))
This however, ***does not support OAuth2*** and only allows verification through email and password. I am ***not*** interested in your data and ***will not*** use it for any other purposes than to authenticate you.
It **will not** be stored on any sorver. If you are still not comfortable with this, feel free to host the project yourself.


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
	docker run -p 80:80 komoot-heatmap:latest
   ```
4. Access http://localhost:80 through an internet browser

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- USAGE EXAMPLES -->
## Usage


1. **Log in** with your credentials at http://localhost:80.

2. You may choose from ***4*** different visualizations:
	* ***Heatmap:*** Displays routes in an opaque red shade, allowing you to see the most used paths
	* ***Speed:*** Gradient from blue to red, indicating the speed at certain points
	* ***Incline:*** Gradient from blue to red, indicating the incline in percent
	* ***Elapsed Time:*** Shows how long you have already been on the tour at a certain point



<!-- ROADMAP -->
## Roadmap

- ~~Get access to Komoot's official API and OAuth2~~
- [x] Offer a ***hosted solution*** for easy access [[Visit hosted version](https://komoot.oskarkraemer.me/)]
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
