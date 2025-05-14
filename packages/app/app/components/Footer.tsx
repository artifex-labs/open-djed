const Footer = () => {
  return (
    <footer className="flex flex-col md:flex-row gap-8 p-8 justify-between bg-white dark:bg-dark-bg border-t border-light-foreground dark:border-primary/30 w-full text-center max-h-fit">
      <div className="flex flex-col md:flex-row gap-6 items-center">
        <img src="/artifex-logo.png" alt="Artifex Labs Logo" className="w-[50px]" />
        <p className="pt-1">All rights reserved © 2025</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-center">
        <a
          href="https://discord.gg/MhYP7w8n8p"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary focus:outline-none transition-colors"
          title="Join community discord server"
        >
          <img src="/discord-logo.png" alt="Discord Logo" className="w-[20px] inline-block mr-2" />
          Discord
        </a>
        <a
          href="https://x.com/ArtifexLab50024"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary focus:outline-none transition-colors"
          title="Follow us for more news"
        >
          <img src="/twitter-logo.png" alt="Twitter Logo" className="w-[20px] inline-block mr-2" />
          Twitter
        </a>
        <a
          href="https://github.com/artifex-labs/reverse-djed"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary focus:outline-none transition-colors"
          title="Look at reverse djed source code"
        >
          <img src="/github-logo.png" alt="GitHub Logo" className="w-[20px] inline-block mr-2" />
          GitHub
        </a>
        <a
          href="https://djed.xyz"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary focus:outline-none transition-colors"
          title="Official djed app"
        >
          <img src="/djed.svg" alt="GitHub Logo" className="w-[20px] inline-block mr-2" />
          djed.xyz
        </a>
      </div>
    </footer>
  )
}

export default Footer
