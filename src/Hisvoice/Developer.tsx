
import { Mail, Globe,  ExternalLink } from "lucide-react";

const DeveloperPage = () => {
  const developer = {
    name: "Endtime Message (Divine Love Chapel)",
    role: "The Bride",
    bio: "A group of believers who have come to the understanding of the message of the hour as preached by the prophet Robert Lambert Lee. We believe that the message of the hour is the message of the Bible and that it is the only message that can prepare the Bride of Christ for the rapture (The Voice of the Christ).",
    avatar: "./cloud.png",
    product: {
      name: "His voice",
      description:
        "A powerful Tauri-based application for reading sermons preached by the prophet Robert Lambert Lee. Visit the website to download the mobile app .",
      websiteImage: "./siteImg.jpg",
      websiteLink: "https://hisvoice.tinny.site",
      mobileApp: {
        name: "His Voice Mobile",
        platforms: ["iOS", "Android"],
        features: ["Offline sermon reading", "Audio playback", "Bookmark favorite passages"],
      },
    },
    links: {
      email: "minwidth49@gmail.com",
      website: "https://hisvoice.tinny.site",
    },
  };

  return (
    <div className="min-h-screen bg-primary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-secondary rounded-lg shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-background to-secondary p-8">
          <div className="flex flex-col sm:flex-row items-center">
            <img
              className="h-24 w-24 rounded-full border-4 border-white shadow-lg mb-4 sm:mb-0"
              src={developer.avatar}
              alt={developer.name}
            />
            <div className="sm:ml-6 text-center sm:text-left">
              <h1 className="text-3xl font-bold text-white">
                {developer.name}
              </h1>
              <p className="text-xl text-purple-200">{developer.role}</p>
            </div>
          </div>
        </div>

        <div className="p-8 text-text">
          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">About Us</h2>
            <p className="text-text">{developer.bio}</p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Other apps</h2>
            <div className="bg-primary rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-accent mb-2">
                {developer.product.name}
              </h3>
              <p className="text-text mb-4">{developer.product.description}</p>
              <div className="mt-6">
                <img
                  src={developer.product.websiteImage}
                  alt="Website Screenshot"
                  className="rounded-lg shadow-md mb-4"
                />
                <a
                  href={developer.product.websiteLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-accent hover:text-purple-300"
                >
                  Go to download
                  <ExternalLink size={16} className="ml-2" />
                </a>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold mb-4">Mobile App</h2>
            <div className="bg-primary rounded-lg p-6">
              <h3 className="text-xl font-semibold text-accent mb-2">
                {developer.product.mobileApp.name}
              </h3>
              <p className="text-text mb-2">
                Available on: {developer.product.mobileApp.platforms.join(", ")}
              </p>
              <ul className="list-disc list-inside text-text">
                {developer.product.mobileApp.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Find out</h2>
            <div className="flex space-x-4">
              <a
                href={`mailto:${developer.links.email}`}
                className="text-text hover:text-accent transition-colors"
              >
                <Mail size={24} />
              </a>
              <a
                href={developer.links.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text hover:text-accent transition-colors"
              >
                <Globe size={24} />
              </a>
          
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default DeveloperPage;