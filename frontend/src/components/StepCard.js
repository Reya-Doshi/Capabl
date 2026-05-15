export default function StepCard({
  number,
  title,
  desc,
  icon,
}) {

  return (

    <div className="flex flex-col items-center text-center gap-5">

      <div className="w-20 h-20 bg-white border border-gray-200 rounded-3xl flex items-center justify-center relative shadow-sm text-[#b89968]">

        {icon}

        <div className="absolute -bottom-2 w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-[11px] font-bold">

          {number}

        </div>

      </div>

      <div>

        <h3 className="font-bold mb-2">
          {title}
        </h3>

        <p className="text-gray-500 text-sm leading-relaxed">

          {desc}

        </p>

      </div>

    </div>
  );
}