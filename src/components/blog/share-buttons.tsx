"use client";

import { Button } from "@/components/ui/button";
import { 
  Twitter, 
  Linkedin, 
  Facebook, 
  Link2, 
  MessageCircle,
  Mail
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ShareButtonsProps {
  title: string;
  excerpt: string;
  url: string;
}

export function ShareButtons({ title, excerpt, url }: ShareButtonsProps) {
  const { toast } = useToast();
  const currentUrl = typeof window !== 'undefined' ? window.location.origin + url : '';

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(currentUrl)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`,
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      toast({
        title: "Link copied!",
        description: "Article link has been copied to clipboard.",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try copying the link manually.",
        variant: "destructive",
      });
    }
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Check out this article: ${title}`);
    const body = encodeURIComponent(`I thought you might find this article interesting:\n\n${title}\n\n${excerpt}\n\nRead more: ${currentUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const shareButtons = [
    {
      name: "Twitter",
      icon: Twitter,
      href: shareLinks.twitter,
      color: "hover:text-blue-500",
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      href: shareLinks.linkedin,
      color: "hover:text-blue-700",
    },
    {
      name: "Facebook",
      icon: Facebook,
      href: shareLinks.facebook,
      color: "hover:text-blue-600",
    },
    {
      name: "Copy Link",
      icon: Link2,
      onClick: handleCopyLink,
      color: "hover:text-green-600",
    },
    {
      name: "Email",
      icon: Mail,
      onClick: handleEmailShare,
      color: "hover:text-gray-600",
    },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {shareButtons.map((button) => {
        const Icon = button.icon;
        return (
          <Button
            key={button.name}
            variant="outline"
            size="sm"
            className={button.color}
            onClick={button.onClick || (() => {
              if (button.href) {
                window.open(button.href, '_blank', 'width=550,height=400');
              }
            })}
          >
            <Icon className="h-4 w-4 mr-2" />
            {button.name}
          </Button>
        );
      })}
    </div>
  );
}