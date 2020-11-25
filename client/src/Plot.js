import * as d3 from 'd3';
import {useEffect, useRef} from 'react';

let width = 860;
let height = 470;

function Plot(props) {
  const refContainer = useRef();
  const {db} = props;

  useEffect(() => {
    let timeline = db.slice(-20).map(s => `${s['TimeSent']},${s['DateSent']}`);
    let para123 = db
      .slice(-20)
      .map(s => [s['Parameter1'], s['Parameter2'], s['Parameter3']])
      .flat();

    let timeConv = d3.timeParse('%H:%M:%S,%Y-%m-%d');
    console.log(para123);
    console.log([Math.min.apply(null, para123), Math.max.apply(null, para123)]);
    //    console.log([d3.min(para123), d3.max(para123)]);

    const xScale = d3
      .scaleTime()
      .range([10, width])
      .domain(d3.extent(timeline, t => timeConv(t)));
    const yScale = d3
      .scaleLinear()
      .range([height, 10])
      .domain([
        Math.min.apply(null, para123) - 2,
        Math.max.apply(null, para123) + 2,
      ]);

    const xAxis = d3.axisBottom().scale(xScale);
    const yAxis = d3.axisLeft().scale(yScale);

    let svg = d3
      .select(refContainer.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('background', '#fafafa');

    svg
      .append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(30, 0)`)
      .call(yAxis);

    svg
      .append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(0, ${height - 30})`)
      .call(xAxis);

    const par1line = d3
      .line()
      .x(d => xScale(timeConv(`${d['TimeSent']},${d['DateSent']}`)))
      .y(d => yScale(d['Parameter1']));

    const par2line = d3
      .line()
      .x(d => xScale(timeConv(`${d['TimeSent']},${d['DateSent']}`)))
      .y(d => yScale(d['Parameter2']));

    const par3line = d3
      .line()
      .x(d => xScale(timeConv(`${d['TimeSent']},${d['DateSent']}`)))
      .y(d => yScale(d['Parameter3']));

    const grp = svg.append('g').attr('transform', `translate(0, 0)`);

    grp
      .append('path')
      .datum(db)
      .attr('fill', 'none')
      .attr('stroke', 'red')
      .attr('stroke-width', '1.5px')
      .attr('d', par1line);

    grp
      .append('path')
      .datum(db)
      .attr('fill', 'none')
      .attr('stroke', 'blue')
      .attr('stroke-width', '1.5px')
      .attr('d', par2line);

    grp
      .append('path')
      .datum(db)
      .attr('fill', 'none')
      .attr('stroke', 'green')
      .attr('stroke-width', '1.5px')
      .attr('d', par3line);

    return () => svg.remove();
  }, [db]);

  return <div ref={refContainer}></div>;
}

export default Plot;
